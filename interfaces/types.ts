// User interfaces
export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: 'user' | 'owner' | 'admin';
    avatar_url?: string;
    created_at: string;
}

// Venue interfaces
export interface Venue {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    photos: string[];
    description?: string;
    operating_hours: { [day: string]: { open: string; close: string } };
    amenities: string[];
    rating: number;
    review_count: number;
    courts: Court[];
    owner_id: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface VenueListItem {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    main_photo?: string;
    rating: number;
    review_count: number;
    min_price: number;
    max_price: number;
    sport_types: string[];
    distance?: number;
}

// Court interfaces
export interface Court {
    id: string;
    venue_id: string;
    name: string;
    sport_type: string;
    base_price: number;
    photos: string[];
    is_active: boolean;
}

// Booking interfaces
export interface Booking {
    id: string;
    user_id?: string;
    court_id: string;
    date: string; // YYYY-MM-DD
    start_time: string; // HH:MM
    end_time: string; // HH:MM
    original_price: number;
    final_price: number;
    status: 'confirmed' | 'completed' | 'cancelled';
    source: 'online' | 'walk_in';
    court?: Court;
    venue?: Venue;
    created_at: string;
}

export interface CreateBookingRequest {
    court_id: string;
    date: string;
    start_time: string;
    end_time: string;
}

// Time slot interfaces
export interface TimeSlot {
    start_time: string; // "09:00"
    end_time: string;   // "10:00"
    status: 'available' | 'booked' | 'blocked';
    booking_id?: string;
}

// Review interfaces
export interface Review {
    id: string;
    booking_id: string;
    user_id: string;
    venue_id: string;
    rating: number;
    comment?: string;
    owner_response?: string;
    created_at: string;
    user?: {
        name: string;
        avatar_url?: string;
    };
}

export interface CreateReviewRequest {
    rating: number;
    comment?: string;
}

// Auth interfaces
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    phone?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        user: User;
        session: {
            access_token: string;
            refresh_token: string;
        };
    };
}

// API Response wrapper
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

// Search/Filter interfaces
export interface VenueSearchParams {
    lat?: number;
    lng?: number;
    radius?: number;
    sport?: string;
    min_price?: number;
    max_price?: number;
    page?: number;
    limit?: number;
}

// Owner-specific interfaces
export interface EarningsSummary {
    total_earnings: number;
    this_week: number;
    this_month: number;
    pending_payouts: number;
}

export interface OwnerBooking extends Booking {
    user_name?: string;
    user_phone?: string;
}

export interface BlockedSlot {
    id: string;
    court_id: string;
    date: string;
    start_time: string;
    end_time: string;
    reason?: string;
}

// Favorites
export interface Favorite {
    id: string;
    user_id: string;
    venue_id: string;
    venue: VenueListItem;
    created_at: string;
}
