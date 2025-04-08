// config/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { findOrCreateOAuthUser } from '../models/authModel';
import dotenv from 'dotenv';
import { VerifyCallback } from 'passport-oauth2';
import pool from '../config/db';

// Extend Express User interface to include our custom properties
declare global {
    namespace Express {
        interface User {
            id: string;
            email: string;
            name: string;
            is_premium: boolean;
        }
    }
}

dotenv.config();

export const configurePassport = () => {
    // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: '/api/auth/google/callback',
        scope: ['profile', 'email']
    }, async (
        _accessToken: string,
        _refreshToken: string,
        profile: any,
        done: VerifyCallback
    ) => {
        try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
                return done(new Error('No email found in Google profile'));
            }

            const userData = {
                id: profile.id,
                displayName: profile.displayName,
                email: email
            };

            const user = await findOrCreateOAuthUser(userData, 'google');
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    // GitHub Strategy
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: '/api/auth/github/callback',
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
                id: profile.id,
                displayName: profile.displayName || profile.username,
                email: email
            };

            const user = await findOrCreateOAuthUser(userData, 'github');
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    // Serialize and deserialize user
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
            const user = result.rows[0];
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};