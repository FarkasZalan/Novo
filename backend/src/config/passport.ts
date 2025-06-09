// Handle OAuth authentication strategies and user session management
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { findOrCreateOAuthUser } from '../models/authModel';
import dotenv from 'dotenv';
import { VerifyCallback } from 'passport-oauth2';
import pool from '../config/db';
import { addUserToProjectQuery, deletePendingUserQuery, getPendingProjectsForPendingUserByEmailQuery } from '../models/projectMemberModel';
import { User } from '../schemas/types/userType';

dotenv.config();

// Extend Express User interface to include our custom properties
declare global {
    namespace Express {
        interface User {
            id: string;
            email: string;
            name: string;
            is_premium: boolean;
            provider: string;
        }
    }
}

export const configurePassport = () => {
    // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback', // What Google sends users after login
        scope: ['profile', 'email'] // What user data we requesting
    }, async (
        _accessToken: string, // if need to call Google API e.g. get Google Calendar events then need to use it, but now it's unused
        _refreshToken: string,
        profile: any, // Contains user data from Google
        done: VerifyCallback // Function to call when we're finished
    ) => {
        try {
            // Extract email from Google profile
            const email = profile.emails?.[0]?.value;

            // if no email found in Google profile then fail authentication
            if (!email) {
                return done(new Error('No email found in Google profile'));
            }

            // Prepare user data for the database
            const userData = {
                displayName: profile.displayName, // User's full name from Google profile
                email: email // User's email
            };

            // Find or create user in the database
            const user = await findOrCreateOAuthUser(userData, 'google');

            const pendingUserProjects = await getPendingProjectsForPendingUserByEmailQuery(user.email);

            if (pendingUserProjects) {
                for (const invite of pendingUserProjects) {
                    try {
                        await addUserToProjectQuery(invite.project_id, user.id, invite.role, invite.inviter_name, invite.inviter_user_id);
                        await deletePendingUserQuery(invite.id);
                    } catch (error) {
                        console.error("oauth activate user error", error);
                    }
                }
            }
            // Success - pass user object to the passport
            return done(null, user);
        } catch (error) {
            // if anything fails, then pass error to the passport
            return done(error);
        }
    }));

    // GitHub Strategy
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
        scope: ['user:email']
    }, async (
        _accessToken: string,
        _refreshToken: string,
        profile: any,
        done: VerifyCallback
    ) => {
        try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
                return done(new Error('No email found in GitHub profile'));
            }

            const userData = {
                displayName: profile.displayName || profile.username,
                email: email
            };

            const user = await findOrCreateOAuthUser(userData, 'github');

            const pendingUserProjects = await getPendingProjectsForPendingUserByEmailQuery(user.email);

            if (pendingUserProjects) {
                for (const invite of pendingUserProjects) {
                    try {
                        await addUserToProjectQuery(invite.project_id, user.id, invite.role, invite.inviter_name, invite.inviter_user_id);
                        await deletePendingUserQuery(invite.id);
                    } catch (error) {
                        console.error("oauth activate user error", error);
                    }
                }
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    // Serialize and deserialize user
    passport.serializeUser((user: any, done: any) => {
        done(null, user.id); // Store only user ID in the session
    });

    // Retrieve user from the session
    passport.deserializeUser(async (id: string, done: any) => {
        try {
            const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
            const user: User = result.rows[0];
            done(null, user); // Attach user object to the req.user
        } catch (error) {
            done(error);
        }
    });
};