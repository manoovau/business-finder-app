export interface userLocalType {
  id: string;
  username: string;
  password: string;
  email: string;
  avatar: string;
}

export interface MapPageChildrenType {
  region?: CenterType;
  markers?: MarkerType[];
}

export interface MarkerType {
  coord: CenterType;
  idCoord: string;
  nameCoord: string;
  imgCoord: string;
  ratingCoord?: number;
}

export interface RegionType {
  center: CenterType;
}

export interface CenterType {
  latitude: number;
  longitude: number;
}

export interface FilterInputType {
  openFilter: string;
  priceFilter: string;
  sortByFilter: string;
  attrFilter: string;
}

export interface InputType {
  business: string | null;
  where: string | null;
}

export interface BusinessesType {
  businesses: ItemInfoType[];
  region: RegionType;
  total: number;
}

export interface ApiErrorResponse {
  error: ApiError;
}

export interface ApiError {
  ok: boolean;
  description?: string | unknown;
  code?: string | unknown;
}

export interface ItemInfoType {
  id: string;
  name: string;
  is_claimed?: boolean;
  is_closed?: boolean;
  photos?: string[];
  categories?: categoriesType[];
  phone?: string | null;
  hours?: HoursType[];
  location?: LocationType;
  price?: string;
  rating?: number;
  review_count?: number;
  transactions?: string[];
  url?: string | null;
  image_url?: string | null;
  coordinates?: CenterType;
}

export interface HoursType {
  hours_type?: string;
  is_open_now?: boolean;
  open: OpenType[];
}

export interface OpenType {
  is_overnight: boolean;
  start: string;
  end: string;
}

export interface LocationType {
  address1?: string | null;
  address2?: string | null;
  address3?: string | null;
  city?: string | null;
  country?: string | null;
  cross_streets?: string | null;
  display_address?: string[];
  state?: string | null;
  zip_code?: string | null;
}

export interface categoriesType {
  alias: string;
  title: string;
}

export interface reviewsType {
  id: string;
  rating: number;
  user: UserType;
  text?: string;
  time_created?: string;
  url?: string | null;
}

export interface UserType {
  id: string;
  profile_url?: string | null;
  image_url?: string | null;
  name: string;
}
