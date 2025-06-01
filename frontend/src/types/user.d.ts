interface User {
    id: string;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
    is_premium: boolean;
    is_verified: boolean;
    premium_start_date: string;
    premium_end_date: string;
    premium_session_id: string;
    user_cancelled_premium: boolean;
    provider: string;
}