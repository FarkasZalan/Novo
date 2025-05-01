interface User {
    id: string;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
    is_premium: boolean;
    is_verified: boolean;
    provider?: string;
}