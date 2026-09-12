export type AttributeDefinition={key:string;label:string;kind:'number'|'money'|'text'|'boolean';min?:number;max?:number;unit?:string;filter?:'min'|'max'|'equals';};
const text=(key:string,label:string):AttributeDefinition=>({key,label,kind:'text',filter:'equals'});
const num=(key:string,label:string,max:number,filter:'min'|'max'='min'):AttributeDefinition=>({key,label,kind:'number',min:0,max,filter});
const bool=(key:string,label:string):AttributeDefinition=>({key,label,kind:'boolean',filter:'equals'});
export const categoryConfig={
 Marketplace:{icon:'ShoppingBag',subcategories:['Electronics','Furniture','Fashion','Collectibles','Jewelry','Tools','General Goods'],attributes:[text('brand','Brand'),text('model','Model'),text('specifications','Specifications')]},
 Vehicles:{icon:'Car',subcategories:['Cars','Trucks','Motorcycles','Boats','RVs','Commercial Vehicles'],attributes:[num('year','Year',2100),text('make','Make'),text('model','Model'),num('mileage','Mileage',3000000,'max'),text('transmission','Transmission'),text('drivetrain','Drivetrain')]},
 'Real Estate':{icon:'House',subcategories:['Homes for Sale','Apartments','Rentals','Commercial Property','Land'],attributes:[num('bedrooms','Bedrooms',100),num('bathrooms','Bathrooms',100),num('sqft','Square feet',100000000),text('property_type','Property type'),bool('pets','Pets allowed'),bool('parking','Parking included')]},
 Businesses:{icon:'BriefcaseBusiness',subcategories:['Local Businesses','SaaS','Websites','E-commerce','Routes','Franchises'],attributes:[{key:'annual_revenue',label:'Annual revenue',kind:'money',min:0,max:1000000000,filter:'min'},{key:'sde',label:'Annual SDE',kind:'money',min:0,max:1000000000,filter:'min'},num('employees','Employees',100000),bool('seller_financing','Seller financing')] as AttributeDefinition[]},
 Services:{icon:'Wrench',subcategories:['Home Services','Contractors','Cleaning','Automotive','Professional Services','Creative Services','Technology Services'],attributes:[text('service_area','Service area'),text('availability','Availability'),bool('insured','Insurance claimed by provider'),text('scope','Service scope')]},
 Equipment:{icon:'Tractor',subcategories:['Construction','Restaurant','Medical','Manufacturing','Agricultural','Commercial Equipment'],attributes:[text('brand','Brand'),text('model','Model'),num('year','Year',2100),num('hours','Operating hours',10000000,'max'),text('specifications','Specifications')]}
} as const;
export type Category=keyof typeof categoryConfig;
export const CATEGORIES=Object.keys(categoryConfig) as Category[];
export const TRANSACTION_TYPES=['For Sale','For Rent','Service Offered','Wanted','Business Opportunity'] as const;
export const PRICE_TYPES=['Fixed','Negotiable','Starting at','Per month','Per day','Per hour','Quote','Maximum budget'] as const;
export const CONDITIONS=['Not applicable','New','Like new','Used — Excellent','Used — Good','Used — Fair','For parts'] as const;
export const attributeDefs=(category:string):readonly AttributeDefinition[]=>categoryConfig[category as Category]?.attributes??[];
