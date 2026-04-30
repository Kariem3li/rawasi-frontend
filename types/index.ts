// types/index.ts

export interface Feature {
    id: string;
    name: string;
    input_type: 'text' | 'number' | 'bool';
    options_list?: string;
    feature_icon?: string;
    icon?: string;
}

export interface Category {
    id: number;
    name: string;
    allowed_features?: Feature[];
}

export interface LocationInfo {
    id: number;
    name: string;
}

export interface Listing {
    id: number;
    title: string;
    price: number | string;
    area_sqm: number;
    offer_type: 'Sale' | 'Rent';
    status: string;
    is_finance_eligible: boolean;
    is_favorite?: boolean;
    thumbnail?: string;
    owner_phone?: string;
    agent?: { phone_number?: string };
    
    governorate?: LocationInfo;
    city?: LocationInfo;
    major_zone?: LocationInfo;
    subdivision?: LocationInfo;
    subdivision_name?: string;
    major_zone_name?: string;
    city_name?: string;
    
    bedrooms?: number;
    bathrooms?: number;
    floor_number?: number;
    dynamic_features?: { feature_name: string; value: string; feature_icon?: string; icon?: string }[];
}