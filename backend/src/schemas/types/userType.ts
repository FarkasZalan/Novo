export interface User {
    id: string;
    name: string;
    email: string;
    created_at: Date;
    updated_at: Date;
    is_premium: boolean;
    is_verified: boolean;
    premium_start_date: Date | null;
    premium_end_date: Date | null;
    premium_session_id: string;
    user_cancelled_premium: boolean;
    provider: string;
    password: string
}