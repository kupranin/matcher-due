/**
 * Fallback job templates when API/DB is unavailable (connection issues, not seeded, etc.).
 * Mirrors the seed structure for both EN and KA.
 */
const FALLBACK_TEMPLATES: Record<"en" | "ka", JobTemplateRole[]> = {
  en: [
    { id: "fb-barista", slug: "barista", title: "Barista", category: "Hospitality", description: "We are looking for a Barista to prepare coffee and serve customers. Experience in customer service is a plus.", skills: [{ skillName: "Customer service", weight: 5 }, { skillName: "Coffee preparation", weight: 5 }, { skillName: "Speed & accuracy", weight: 4 }, { skillName: "Cash handling", weight: 4 }, { skillName: "Cleanliness", weight: 4 }] },
    { id: "fb-cashier", slug: "cashier", title: "Cashier", category: "Retail", description: "We need a Cashier for point-of-sale and customer service. Attention to detail and reliability required.", skills: [{ skillName: "Cash handling", weight: 5 }, { skillName: "Attention to detail", weight: 5 }, { skillName: "Customer service", weight: 4 }, { skillName: "Speed & accuracy", weight: 4 }, { skillName: "POS systems", weight: 4 }] },
    { id: "fb-waiter", slug: "waiter", title: "Waiter/Waitress", category: "Hospitality", description: "We are hiring Waiters/Waitresses for table service. Good communication and teamwork skills needed.", skills: [{ skillName: "Customer service", weight: 5 }, { skillName: "Communication", weight: 4 }, { skillName: "Time management", weight: 4 }, { skillName: "Teamwork", weight: 4 }, { skillName: "Upselling", weight: 3 }] },
    { id: "fb-sales", slug: "sales-associate", title: "Sales Associate", category: "Retail", description: "We seek a Sales Associate to assist customers and drive sales. Product knowledge and enthusiasm welcome.", skills: [{ skillName: "Communication", weight: 5 }, { skillName: "Upselling", weight: 4 }, { skillName: "Customer service", weight: 4 }, { skillName: "Product knowledge", weight: 4 }, { skillName: "Problem solving", weight: 3 }] },
    { id: "fb-call", slug: "call-center-agent", title: "Call Center Agent", category: "Customer Service", description: "We need Call Center Agents for customer support. Strong communication and patience are essential.", skills: [{ skillName: "Communication", weight: 5 }, { skillName: "Active listening", weight: 4 }, { skillName: "Typing", weight: 4 }, { skillName: "Problem solving", weight: 4 }, { skillName: "Patience", weight: 4 }] },
    { id: "fb-warehouse", slug: "warehouse-worker", title: "Warehouse Worker", category: "Logistics", description: "We are hiring Warehouse Workers for packing and logistics. Physical stamina and safety awareness required.", skills: [{ skillName: "Physical stamina", weight: 5 }, { skillName: "Attention to detail", weight: 4 }, { skillName: "Teamwork", weight: 4 }, { skillName: "Time management", weight: 4 }, { skillName: "Safety awareness", weight: 5 }] },
    { id: "fb-receptionist", slug: "receptionist", title: "Receptionist", category: "Admin", description: "We need a Receptionist for front desk and admin duties. Organization and computer skills required.", skills: [{ skillName: "Communication", weight: 5 }, { skillName: "Organization", weight: 5 }, { skillName: "Customer service", weight: 4 }, { skillName: "Computer basics", weight: 4 }, { skillName: "Multitasking", weight: 4 }] },
    { id: "fb-courier", slug: "delivery-courier", title: "Delivery Courier", category: "Logistics", description: "We are looking for Delivery Couriers. Reliable, good with navigation and time management.", skills: [{ skillName: "Time management", weight: 5 }, { skillName: "Navigation", weight: 4 }, { skillName: "Customer service", weight: 4 }, { skillName: "Reliability", weight: 5 }, { skillName: "Problem solving", weight: 3 }] },
    { id: "fb-kitchen", slug: "kitchen-assistant", title: "Kitchen Assistant", category: "Hospitality", description: "We need Kitchen Assistants to support food prep and cleanliness. Teamwork and following instructions essential.", skills: [{ skillName: "Teamwork", weight: 5 }, { skillName: "Cleanliness", weight: 5 }, { skillName: "Speed & accuracy", weight: 4 }, { skillName: "Following instructions", weight: 4 }, { skillName: "Safety awareness", weight: 4 }] },
    { id: "fb-cleaner", slug: "cleaner", title: "Cleaner", category: "Maintenance", description: "We are hiring Cleaners for maintaining our premises. Reliability and attention to detail required.", skills: [{ skillName: "Attention to detail", weight: 5 }, { skillName: "Reliability", weight: 5 }, { skillName: "Cleanliness", weight: 5 }, { skillName: "Time management", weight: 4 }, { skillName: "Physical stamina", weight: 3 }] },
    { id: "fb-security", slug: "security-guard", title: "Security Guard", category: "Security", description: "We seek Security Guards for site safety. Calm under pressure and good observation skills needed.", skills: [{ skillName: "Safety awareness", weight: 5 }, { skillName: "Communication", weight: 4 }, { skillName: "Observation", weight: 4 }, { skillName: "Reliability", weight: 5 }, { skillName: "Calm under pressure", weight: 5 }] },
    { id: "fb-pharmacy", slug: "pharmacy-assistant", title: "Pharmacy Assistant", category: "Healthcare", description: "We need a Pharmacy Assistant for customer service and organization. Attention to detail essential.", skills: [{ skillName: "Attention to detail", weight: 5 }, { skillName: "Customer service", weight: 5 }, { skillName: "Communication", weight: 4 }, { skillName: "Organization", weight: 4 }, { skillName: "Reliability", weight: 4 }] },
    { id: "fb-housekeeping", slug: "hotel-housekeeping", title: "Hotel Housekeeping", category: "Hospitality", description: "We are hiring Hotel Housekeeping staff. Cleanliness and time management skills required.", skills: [{ skillName: "Attention to detail", weight: 5 }, { skillName: "Cleanliness", weight: 5 }, { skillName: "Time management", weight: 4 }, { skillName: "Reliability", weight: 4 }, { skillName: "Physical stamina", weight: 3 }] },
    { id: "fb-merchandiser", slug: "retail-merchandiser", title: "Retail Merchandiser", category: "Retail", description: "We need Retail Merchandisers for product placement and displays. Organization and teamwork required.", skills: [{ skillName: "Organization", weight: 5 }, { skillName: "Attention to detail", weight: 4 }, { skillName: "Time management", weight: 4 }, { skillName: "Teamwork", weight: 4 }, { skillName: "Product placement", weight: 4 }] },
    { id: "fb-accountant", slug: "junior-accountant", title: "Junior Accountant", category: "Finance", description: "We seek a Junior Accountant. Excel basics and numeracy required. Attention to detail essential.", skills: [{ skillName: "Excel basics", weight: 5 }, { skillName: "Attention to detail", weight: 5 }, { skillName: "Organization", weight: 4 }, { skillName: "Numeracy", weight: 5 }, { skillName: "Time management", weight: 4 }] },
    { id: "fb-office", slug: "office-assistant", title: "Office Assistant", category: "Admin", description: "We are hiring an Office Assistant for admin support. Organization and computer skills needed.", skills: [{ skillName: "Organization", weight: 5 }, { skillName: "Communication", weight: 4 }, { skillName: "Computer basics", weight: 4 }, { skillName: "Time management", weight: 4 }, { skillName: "Reliability", weight: 4 }] },
    { id: "fb-bartender", slug: "bartender", title: "Bartender", category: "Hospitality", description: "We need a Bartender to prepare drinks and serve customers. Customer service and speed are essential.", skills: [{ skillName: "Customer service", weight: 5 }, { skillName: "Communication", weight: 4 }, { skillName: "Speed & accuracy", weight: 4 }, { skillName: "Teamwork", weight: 3 }] },
    { id: "fb-line-cook", slug: "line-cook", title: "Chef / Line Cook", category: "Hospitality", description: "We are hiring Line Cooks for our kitchen. Teamwork and cleanliness required.", skills: [{ skillName: "Teamwork", weight: 5 }, { skillName: "Cleanliness", weight: 5 }, { skillName: "Following instructions", weight: 4 }, { skillName: "Safety awareness", weight: 4 }] },
    { id: "fb-data-entry", slug: "data-entry-clerk", title: "Data Entry Clerk", category: "Admin", description: "We need Data Entry Clerks for typing and data management. Attention to detail essential.", skills: [{ skillName: "Typing", weight: 5 }, { skillName: "Attention to detail", weight: 5 }, { skillName: "Organization", weight: 4 }, { skillName: "Computer basics", weight: 4 }] },
    { id: "fb-driver", slug: "driver", title: "Driver", category: "Logistics", description: "We are looking for reliable Drivers. Good navigation and time management skills needed.", skills: [{ skillName: "Reliability", weight: 5 }, { skillName: "Time management", weight: 5 }, { skillName: "Navigation", weight: 4 }, { skillName: "Safety awareness", weight: 5 }] },
    { id: "fb-hotel-front", slug: "hotel-front-desk", title: "Hotel Front Desk Agent", category: "Hospitality", description: "We need Hotel Front Desk staff for guest check-in and support. Customer service skills required.", skills: [{ skillName: "Customer service", weight: 5 }, { skillName: "Communication", weight: 5 }, { skillName: "Organization", weight: 4 }, { skillName: "Computer basics", weight: 4 }] },
    { id: "fb-nanny", slug: "nanny", title: "Nanny / Childcare", category: "Care", description: "We seek a reliable Nanny for childcare. Patience and reliability essential.", skills: [{ skillName: "Patience", weight: 5 }, { skillName: "Communication", weight: 4 }, { skillName: "Reliability", weight: 5 }, { skillName: "Organization", weight: 3 }] },
    { id: "fb-stock", slug: "stock-associate", title: "Stock Associate", category: "Retail", description: "We need Stock Associates for inventory and shelf restocking. Physical stamina and attention to detail required.", skills: [{ skillName: "Physical stamina", weight: 4 }, { skillName: "Attention to detail", weight: 5 }, { skillName: "Teamwork", weight: 4 }, { skillName: "Organization", weight: 4 }] },
    { id: "fb-restaurant-host", slug: "restaurant-host", title: "Restaurant Host", category: "Hospitality", description: "We are hiring Restaurant Hosts to greet guests and manage seating. Customer service and organization required.", skills: [{ skillName: "Customer service", weight: 5 }, { skillName: "Communication", weight: 4 }, { skillName: "Organization", weight: 4 }, { skillName: "Teamwork", weight: 3 }] },
    { id: "fb-construction", slug: "construction-laborer", title: "Construction Laborer", category: "Construction", description: "We need Construction Laborers. Physical stamina and safety awareness required.", skills: [{ skillName: "Physical stamina", weight: 5 }, { skillName: "Teamwork", weight: 4 }, { skillName: "Safety awareness", weight: 5 }, { skillName: "Following instructions", weight: 4 }] },
    { id: "fb-event-staff", slug: "event-staff", title: "Event Staff", category: "Hospitality", description: "We hire Event Staff for conferences and events. Customer service and flexibility required.", skills: [{ skillName: "Customer service", weight: 5 }, { skillName: "Teamwork", weight: 5 }, { skillName: "Flexibility", weight: 3 }, { skillName: "Communication", weight: 4 }] },
    { id: "fb-laundry", slug: "laundry-worker", title: "Laundry Worker", category: "Maintenance", description: "We need Laundry Workers for our facilities. Attention to detail and reliability required.", skills: [{ skillName: "Attention to detail", weight: 5 }, { skillName: "Reliability", weight: 5 }, { skillName: "Physical stamina", weight: 3 }, { skillName: "Time management", weight: 4 }] },
    { id: "fb-handyman", slug: "handyman", title: "Handyman", category: "Maintenance", description: "We seek a Handyman for repairs and maintenance. Problem solving and reliability essential.", skills: [{ skillName: "Problem solving", weight: 5 }, { skillName: "Reliability", weight: 5 }, { skillName: "Following instructions", weight: 4 }, { skillName: "Safety awareness", weight: 4 }] },
    { id: "fb-teaching", slug: "teaching-assistant", title: "Teaching Assistant", category: "Education", description: "We need Teaching Assistants to support classroom activities. Communication and patience required.", skills: [{ skillName: "Communication", weight: 5 }, { skillName: "Patience", weight: 5 }, { skillName: "Organization", weight: 4 }, { skillName: "Teamwork", weight: 4 }] },
    { id: "fb-gardener", slug: "gardener", title: "Gardener", category: "Maintenance", description: "We need Gardeners for landscaping and grounds. Physical stamina and attention to detail required.", skills: [{ skillName: "Physical stamina", weight: 5 }, { skillName: "Attention to detail", weight: 4 }, { skillName: "Reliability", weight: 4 }] },
    { id: "fb-painter", slug: "painter", title: "Painter", category: "Construction", description: "We hire Painters for interior and exterior work. Attention to detail and following instructions essential.", skills: [{ skillName: "Attention to detail", weight: 5 }, { skillName: "Following instructions", weight: 4 }, { skillName: "Physical stamina", weight: 3 }] },
    { id: "fb-pet-groomer", slug: "pet-groomer", title: "Pet Groomer", category: "Care", description: "We need Pet Groomers. Patience and customer service skills required.", skills: [{ skillName: "Patience", weight: 5 }, { skillName: "Customer service", weight: 4 }, { skillName: "Attention to detail", weight: 4 }] },
    { id: "fb-tailor", slug: "tailor", title: "Tailor / Seamstress", category: "Retail", description: "We seek a Tailor for alterations and sewing. Attention to detail and following instructions required.", skills: [{ skillName: "Attention to detail", weight: 5 }, { skillName: "Following instructions", weight: 4 }, { skillName: "Organization", weight: 3 }] },
    { id: "fb-hotel-bellhop", slug: "hotel-bellhop", title: "Hotel Bellhop", category: "Hospitality", description: "We need Hotel Bellhops for guest luggage and assistance. Customer service and teamwork required.", skills: [{ skillName: "Customer service", weight: 5 }, { skillName: "Physical stamina", weight: 4 }, { skillName: "Teamwork", weight: 4 }] },
    { id: "fb-bakery", slug: "bakery-assistant", title: "Bakery Assistant", category: "Hospitality", description: "We hire Bakery Assistants. Cleanliness and following instructions essential.", skills: [{ skillName: "Cleanliness", weight: 5 }, { skillName: "Following instructions", weight: 5 }, { skillName: "Teamwork", weight: 4 }] },
    { id: "fb-grocery", slug: "grocery-clerk", title: "Grocery Clerk", category: "Retail", description: "We need Grocery Clerks for shelf stocking and customer service.", skills: [{ skillName: "Customer service", weight: 5 }, { skillName: "Attention to detail", weight: 4 }, { skillName: "Teamwork", weight: 4 }] },
    { id: "fb-fuel", slug: "fuel-station-attendant", title: "Fuel Station Attendant", category: "Retail", description: "We need Fuel Station Attendants. Cash handling and reliability required.", skills: [{ skillName: "Cash handling", weight: 5 }, { skillName: "Customer service", weight: 4 }, { skillName: "Reliability", weight: 5 }] },
    { id: "fb-car-wash", slug: "car-wash-attendant", title: "Car Wash Attendant", category: "Maintenance", description: "We hire Car Wash Attendants. Attention to detail and reliability required.", skills: [{ skillName: "Attention to detail", weight: 5 }, { skillName: "Physical stamina", weight: 4 }, { skillName: "Reliability", weight: 4 }] },
    { id: "fb-concierge", slug: "concierge", title: "Concierge", category: "Hospitality", description: "We need a Concierge for guest services. Customer service and organization required.", skills: [{ skillName: "Customer service", weight: 5 }, { skillName: "Communication", weight: 5 }, { skillName: "Organization", weight: 4 }] },
    { id: "fb-tour-guide", slug: "tour-guide", title: "Tour Guide", category: "Hospitality", description: "We seek Tour Guides. Communication and customer service essential.", skills: [{ skillName: "Communication", weight: 5 }, { skillName: "Customer service", weight: 5 }, { skillName: "Organization", weight: 4 }] },
    { id: "fb-cinema", slug: "cinema-usher", title: "Cinema Usher", category: "Hospitality", description: "We need Cinema Ushers. Customer service and teamwork required.", skills: [{ skillName: "Customer service", weight: 5 }, { skillName: "Teamwork", weight: 4 }, { skillName: "Reliability", weight: 4 }] },
    { id: "fb-gym", slug: "gym-front-desk", title: "Gym Front Desk", category: "Hospitality", description: "We hire Gym Front Desk staff. Customer service and organization required.", skills: [{ skillName: "Customer service", weight: 5 }, { skillName: "Communication", weight: 4 }, { skillName: "Organization", weight: 4 }] },
    { id: "fb-lifeguard", slug: "lifeguard", title: "Pool Lifeguard", category: "Care", description: "We need Pool Lifeguards. Safety awareness and observation skills essential.", skills: [{ skillName: "Safety awareness", weight: 5 }, { skillName: "Observation", weight: 5 }, { skillName: "Communication", weight: 4 }] },
    { id: "fb-elderly-care", slug: "elderly-care-assistant", title: "Elderly Care Assistant", category: "Care", description: "We seek Elderly Care Assistants. Patience and reliability essential.", skills: [{ skillName: "Patience", weight: 5 }, { skillName: "Communication", weight: 5 }, { skillName: "Reliability", weight: 5 }] },
    { id: "fb-medical-rec", slug: "medical-receptionist", title: "Medical Receptionist", category: "Healthcare", description: "We need Medical Receptionists. Communication and organization required.", skills: [{ skillName: "Communication", weight: 5 }, { skillName: "Organization", weight: 5 }, { skillName: "Customer service", weight: 4 }] },
    { id: "fb-dental-rec", slug: "dental-receptionist", title: "Dental Receptionist", category: "Healthcare", description: "We need a Dental Receptionist. Customer service and organization required.", skills: [{ skillName: "Customer service", weight: 5 }, { skillName: "Organization", weight: 5 }, { skillName: "Communication", weight: 4 }] },
    { id: "fb-vet", slug: "veterinary-assistant", title: "Veterinary Assistant", category: "Healthcare", description: "We need Veterinary Assistants. Patience and attention to detail required.", skills: [{ skillName: "Patience", weight: 5 }, { skillName: "Attention to detail", weight: 5 }, { skillName: "Communication", weight: 4 }] },
    { id: "fb-farm", slug: "farm-worker", title: "Farm Worker", category: "Agriculture", description: "We hire Farm Workers. Physical stamina and reliability required.", skills: [{ skillName: "Physical stamina", weight: 5 }, { skillName: "Reliability", weight: 5 }, { skillName: "Following instructions", weight: 4 }] },
    { id: "fb-florist", slug: "florist-assistant", title: "Florist Assistant", category: "Retail", description: "We need Florist Assistants. Attention to detail and customer service required.", skills: [{ skillName: "Attention to detail", weight: 5 }, { skillName: "Customer service", weight: 4 }, { skillName: "Organization", weight: 3 }] },
    { id: "fb-packer", slug: "packer", title: "Packer", category: "Logistics", description: "We need Packers. Attention to detail and speed required.", skills: [{ skillName: "Attention to detail", weight: 5 }, { skillName: "Speed & accuracy", weight: 4 }, { skillName: "Teamwork", weight: 4 }] },
    { id: "fb-order-picker", slug: "order-picker", title: "Order Picker", category: "Logistics", description: "We hire Order Pickers. Attention to detail and physical stamina required.", skills: [{ skillName: "Attention to detail", weight: 5 }, { skillName: "Physical stamina", weight: 4 }, { skillName: "Time management", weight: 4 }] },
    { id: "fb-moving", slug: "moving-helper", title: "Moving Helper", category: "Logistics", description: "We need Moving Helpers. Physical stamina and teamwork required.", skills: [{ skillName: "Physical stamina", weight: 5 }, { skillName: "Teamwork", weight: 5 }, { skillName: "Reliability", weight: 4 }] },
    { id: "fb-janitor", slug: "janitor", title: "Janitor", category: "Maintenance", description: "We hire Janitors. Cleanliness and reliability required.", skills: [{ skillName: "Cleanliness", weight: 5 }, { skillName: "Reliability", weight: 5 }, { skillName: "Physical stamina", weight: 3 }] },
    { id: "fb-window", slug: "window-cleaner", title: "Window Cleaner", category: "Maintenance", description: "We need Window Cleaners. Attention to detail and safety awareness required.", skills: [{ skillName: "Attention to detail", weight: 5 }, { skillName: "Safety awareness", weight: 5 }, { skillName: "Reliability", weight: 4 }] },
    { id: "fb-electrician", slug: "electrician-assistant", title: "Electrician Assistant", category: "Construction", description: "We seek an Electrician Assistant. Following instructions and safety awareness required.", skills: [{ skillName: "Following instructions", weight: 5 }, { skillName: "Safety awareness", weight: 5 }, { skillName: "Attention to detail", weight: 4 }] },
    { id: "fb-plumber", slug: "plumber-assistant", title: "Plumber Assistant", category: "Construction", description: "We need a Plumber Assistant. Problem solving and following instructions required.", skills: [{ skillName: "Problem solving", weight: 4 }, { skillName: "Following instructions", weight: 5 }, { skillName: "Physical stamina", weight: 4 }] },
    { id: "fb-tile", slug: "tile-setter-assistant", title: "Tile Setter Assistant", category: "Construction", description: "We hire Tile Setter Assistants. Attention to detail and following instructions required.", skills: [{ skillName: "Attention to detail", weight: 5 }, { skillName: "Following instructions", weight: 5 }, { skillName: "Teamwork", weight: 3 }] },
    { id: "fb-mechanic", slug: "mechanic-assistant", title: "Mechanic Assistant", category: "Automotive", description: "We need a Mechanic Assistant. Following instructions and attention to detail required.", skills: [{ skillName: "Following instructions", weight: 5 }, { skillName: "Attention to detail", weight: 5 }, { skillName: "Problem solving", weight: 4 }] },
    { id: "fb-auto-detail", slug: "auto-detailer", title: "Auto Detailer", category: "Automotive", description: "We hire Auto Detailers. Attention to detail and cleanliness required.", skills: [{ skillName: "Attention to detail", weight: 5 }, { skillName: "Cleanliness", weight: 5 }, { skillName: "Reliability", weight: 4 }] },
    { id: "fb-hairdresser", slug: "hairdresser-assistant", title: "Hairdresser Assistant", category: "Beauty", description: "We need a Hairdresser Assistant. Customer service and communication required.", skills: [{ skillName: "Customer service", weight: 5 }, { skillName: "Communication", weight: 4 }, { skillName: "Following instructions", weight: 4 }] },
    { id: "fb-nail", slug: "nail-technician", title: "Nail Technician", category: "Beauty", description: "We hire Nail Technicians. Attention to detail and customer service required.", skills: [{ skillName: "Attention to detail", weight: 5 }, { skillName: "Customer service", weight: 5 }, { skillName: "Cleanliness", weight: 4 }] },
    { id: "fb-spa", slug: "spa-receptionist", title: "Spa Receptionist", category: "Beauty", description: "We need a Spa Receptionist. Customer service and organization required.", skills: [{ skillName: "Customer service", weight: 5 }, { skillName: "Organization", weight: 5 }, { skillName: "Communication", weight: 4 }] },
    { id: "fb-inventory", slug: "inventory-clerk", title: "Inventory Clerk", category: "Admin", description: "We need Inventory Clerks. Attention to detail and organization required.", skills: [{ skillName: "Attention to detail", weight: 5 }, { skillName: "Organization", weight: 5 }, { skillName: "Computer basics", weight: 4 }] },
    { id: "fb-shipping", slug: "shipping-clerk", title: "Shipping Clerk", category: "Logistics", description: "We hire Shipping Clerks. Organization and attention to detail required.", skills: [{ skillName: "Organization", weight: 5 }, { skillName: "Attention to detail", weight: 5 }, { skillName: "Time management", weight: 4 }] },
    { id: "fb-admin-clerk", slug: "admin-clerk", title: "Admin Clerk", category: "Admin", description: "We need Admin Clerks. Organization and computer skills required.", skills: [{ skillName: "Organization", weight: 5 }, { skillName: "Computer basics", weight: 5 }, { skillName: "Communication", weight: 4 }] },
    { id: "fb-museum", slug: "museum-attendant", title: "Museum Attendant", category: "Hospitality", description: "We need Museum Attendants. Customer service and observation required.", skills: [{ skillName: "Customer service", weight: 5 }, { skillName: "Observation", weight: 4 }, { skillName: "Reliability", weight: 5 }] },
    { id: "fb-parking", slug: "parking-attendant", title: "Parking Attendant", category: "Logistics", description: "We hire Parking Attendants. Customer service and cash handling required.", skills: [{ skillName: "Customer service", weight: 5 }, { skillName: "Cash handling", weight: 4 }, { skillName: "Reliability", weight: 5 }] },
    { id: "fb-lab", slug: "lab-assistant", title: "Lab Assistant", category: "Healthcare", description: "We need Lab Assistants. Attention to detail and following instructions required.", skills: [{ skillName: "Attention to detail", weight: 5 }, { skillName: "Following instructions", weight: 5 }, { skillName: "Organization", weight: 4 }] },
    { id: "fb-loss-prevention", slug: "loss-prevention-officer", title: "Loss Prevention Officer", category: "Security", description: "We seek Loss Prevention Officers. Observation and calm under pressure required.", skills: [{ skillName: "Observation", weight: 5 }, { skillName: "Communication", weight: 4 }, { skillName: "Calm under pressure", weight: 5 }] },
    { id: "fb-prep-cook", slug: "prep-cook", title: "Prep Cook", category: "Hospitality", description: "We need Prep Cooks. Speed, accuracy and cleanliness required.", skills: [{ skillName: "Speed & accuracy", weight: 5 }, { skillName: "Cleanliness", weight: 5 }, { skillName: "Following instructions", weight: 4 }] },
    { id: "fb-carpet", slug: "carpet-cleaner", title: "Carpet Cleaner", category: "Maintenance", description: "We hire Carpet Cleaners. Attention to detail and reliability required.", skills: [{ skillName: "Attention to detail", weight: 5 }, { skillName: "Physical stamina", weight: 4 }, { skillName: "Reliability", weight: 5 }] },
    { id: "fb-vineyard", slug: "vineyard-worker", title: "Vineyard Worker", category: "Agriculture", description: "We need Vineyard Workers. Physical stamina and attention to detail required.", skills: [{ skillName: "Physical stamina", weight: 5 }, { skillName: "Attention to detail", weight: 4 }, { skillName: "Following instructions", weight: 4 }] },
    { id: "fb-printer", slug: "printer-bindery", title: "Printer / Bindery Worker", category: "Logistics", description: "We need Printer/Bindery Workers. Attention to detail and following instructions required.", skills: [{ skillName: "Attention to detail", weight: 5 }, { skillName: "Following instructions", weight: 5 }, { skillName: "Organization", weight: 4 }] },
    { id: "fb-retail-supervisor", slug: "retail-supervisor", title: "Retail Supervisor", category: "Retail", description: "We seek Retail Supervisors. Communication and teamwork required.", skills: [{ skillName: "Communication", weight: 5 }, { skillName: "Teamwork", weight: 5 }, { skillName: "Organization", weight: 5 }] },
    { id: "fb-welder", slug: "welder-entry", title: "Welder (entry)", category: "Construction", description: "We hire entry-level Welders. Following instructions and safety awareness required.", skills: [{ skillName: "Following instructions", weight: 5 }, { skillName: "Safety awareness", weight: 5 }, { skillName: "Attention to detail", weight: 4 }] },
  ],
  ka: [
    { id: "fb-barista", slug: "barista", title: "ბარისტა", category: "სასტუმრო მომსახურება", description: "ჩვენ ვეძებთ ბარისტას ყავის მომზადებისა და მომხმარებლების მომსახურებისთვის. მომხმარებელთა მომსახურების გამოცდილება სასურველია.", skills: [{ skillName: "მომხმარებელთა მომსახურება", weight: 5 }, { skillName: "ყავის მომზადება", weight: 5 }, { skillName: "სიჩქარე და სიზუსტე", weight: 4 }, { skillName: "ნაღდი ფულის მუშაობა", weight: 4 }, { skillName: "სისუფთავე", weight: 4 }] },
    { id: "fb-cashier", slug: "cashier", title: "მოლარე", category: "საცალო ვაჭრობა", description: "გვჭირდება მოლარე კასსა და მომხმარებელთა მომსახურებისთვის. საჭიროა ზრუნვა დეტალებზე და საიმედოობა.", skills: [{ skillName: "ნაღდი ფულის მუშაობა", weight: 5 }, { skillName: "ზრუნვა დეტალებზე", weight: 5 }, { skillName: "მომხმარებელთა მომსახურება", weight: 4 }, { skillName: "სიჩქარე და სიზუსტე", weight: 4 }, { skillName: "პოს სისტემები", weight: 4 }] },
    { id: "fb-waiter", slug: "waiter", title: "მიმტანი", category: "სასტუმრო მომსახურება", description: "ვიყენებთ მიმტანებს სტუმრების მომსახურებისთვის. საჭიროა კომუნიკაციისა და გუნდური მუშაობის უნარები.", skills: [{ skillName: "მომხმარებელთა მომსახურება", weight: 5 }, { skillName: "კომუნიკაცია", weight: 4 }, { skillName: "დროის მართვა", weight: 4 }, { skillName: "გუნდური მუშაობა", weight: 4 }, { skillName: "დამატებითი გაყიდვა", weight: 3 }] },
    { id: "fb-sales", slug: "sales-associate", title: "გამყიდველი", category: "საცალო ვაჭრობა", description: "ვეძებთ გამყიდველს მომხმარებლების დასახმარებლად და გაყიდვების გასაზრდელად. პროდუქტის ცოდნა სასურველია.", skills: [{ skillName: "კომუნიკაცია", weight: 5 }, { skillName: "დამატებითი გაყიდვა", weight: 4 }, { skillName: "მომხმარებელთა მომსახურება", weight: 4 }, { skillName: "პროდუქტის ცოდნა", weight: 4 }, { skillName: "პრობლემის გადაჭრა", weight: 3 }] },
    { id: "fb-call", slug: "call-center-agent", title: "სატელეფონო ოპერატორი", category: "მომხმარებელთა მომსახურება", description: "გვჭირდება სატელეფონო ოპერატორები მომხმარებელთა მხარდაჭერისთვის. საჭიროა კომუნიკაცია და მომთმენი.", skills: [{ skillName: "კომუნიკაცია", weight: 5 }, { skillName: "აქტიური მოსმენა", weight: 4 }, { skillName: "ბეჭდვა", weight: 4 }, { skillName: "პრობლემის გადაჭრა", weight: 4 }, { skillName: "მომთმენი", weight: 4 }] },
    { id: "fb-warehouse", slug: "warehouse-worker", title: "საწყობის მუშა", category: "ლოგისტიკა", description: "ვიყენებთ საწყობის მუშებს შეფუთვისა და ლოგისტიკისთვის. საჭიროა ფიზიკური გამძლეობა და უსაფრთხოებაზე ზრუნვა.", skills: [{ skillName: "ფიზიკური გამძლეობა", weight: 5 }, { skillName: "ზრუნვა დეტალებზე", weight: 4 }, { skillName: "გუნდური მუშაობა", weight: 4 }, { skillName: "დროის მართვა", weight: 4 }, { skillName: "უსაფრთხოების ცნობიერება", weight: 5 }] },
    { id: "fb-receptionist", slug: "receptionist", title: "ადმინისტრატორი", category: "ადმინისტრაცია", description: "გვჭირდება ადმინისტრატორი მიღებისა და ადმინისტრაციული საქმეებისთვის. საჭიროა ორგანიზებულობა და კომპიუტერული უნარები.", skills: [{ skillName: "კომუნიკაცია", weight: 5 }, { skillName: "ორგანიზებულობა", weight: 5 }, { skillName: "მომხმარებელთა მომსახურება", weight: 4 }, { skillName: "კომპიუტერის საფუძვლები", weight: 4 }, { skillName: "მრავალამოცანიანობა", weight: 4 }] },
    { id: "fb-courier", slug: "delivery-courier", title: "კურიერი", category: "ლოგისტიკა", description: "ვეძებთ კურიერებს. საიმედო, ნავიგაციასა და დროის მართვაში ძლიერი.", skills: [{ skillName: "დროის მართვა", weight: 5 }, { skillName: "ნავიგაცია", weight: 4 }, { skillName: "მომხმარებელთა მომსახურება", weight: 4 }, { skillName: "საიმედოობა", weight: 5 }, { skillName: "პრობლემის გადაჭრა", weight: 3 }] },
    { id: "fb-kitchen", slug: "kitchen-assistant", title: "სამზარეულოს დამხმარე", category: "სასტუმრო მომსახურება", description: "გვჭირდება სამზარეულოს დამხმარეები საკვების მომზადებისა და სისუფთავისთვის. საჭიროა გუნდური მუშაობა.", skills: [{ skillName: "გუნდური მუშაობა", weight: 5 }, { skillName: "სისუფთავე", weight: 5 }, { skillName: "სიჩქარე და სიზუსტე", weight: 4 }, { skillName: "ინსტრუქციების შესრულება", weight: 4 }, { skillName: "უსაფრთხოების ცნობიერება", weight: 4 }] },
    { id: "fb-cleaner", slug: "cleaner", title: "დამლაგებელი", category: "მომსახურება", description: "ვიყენებთ დამლაგებლებს ჩვენი ობიექტების სისუფთავისთვის. საჭიროა საიმედოობა და ზრუნვა დეტალებზე.", skills: [{ skillName: "ზრუნვა დეტალებზე", weight: 5 }, { skillName: "საიმედოობა", weight: 5 }, { skillName: "სისუფთავე", weight: 5 }, { skillName: "დროის მართვა", weight: 4 }, { skillName: "ფიზიკური გამძლეობა", weight: 3 }] },
    { id: "fb-security", slug: "security-guard", title: "დაცვის თანამშრომელი", category: "უსაფრთხოება", description: "ვეძებთ დაცვის თანამშრომლებს ობიექტის უსაფრთხოებისთვის. საჭიროა მშვიდობა სტრესის დროს და დაკვირვება.", skills: [{ skillName: "უსაფრთხოების ცნობიერება", weight: 5 }, { skillName: "კომუნიკაცია", weight: 4 }, { skillName: "დაკვირვება", weight: 4 }, { skillName: "საიმედოობა", weight: 5 }, { skillName: "მშვიდობა სტრესის დროს", weight: 5 }] },
    { id: "fb-pharmacy", slug: "pharmacy-assistant", title: "აფთიაქის დამხმარე", category: "ჯანდაცვა", description: "გვჭირდება აფთიაქის დამხმარე მომხმარებელთა მომსახურებისა და ორგანიზებას. საჭიროა ზრუნვა დეტალებზე.", skills: [{ skillName: "ზრუნვა დეტალებზე", weight: 5 }, { skillName: "მომხმარებელთა მომსახურება", weight: 5 }, { skillName: "კომუნიკაცია", weight: 4 }, { skillName: "ორგანიზებულობა", weight: 4 }, { skillName: "საიმედოობა", weight: 4 }] },
    { id: "fb-housekeeping", slug: "hotel-housekeeping", title: "სასტუმროს დამლაგებელი", category: "სასტუმრო მომსახურება", description: "ვიყენებთ სასტუმროს დამლაგებლებს. საჭიროა სისუფთავისა და დროის მართვის უნარები.", skills: [{ skillName: "ზრუნვა დეტალებზე", weight: 5 }, { skillName: "სისუფთავე", weight: 5 }, { skillName: "დროის მართვა", weight: 4 }, { skillName: "საიმედოობა", weight: 4 }, { skillName: "ფიზიკური გამძლეობა", weight: 3 }] },
    { id: "fb-merchandiser", slug: "retail-merchandiser", title: "საცალო მერჩანდაიზერი", category: "საცალო ვაჭრობა", description: "გვჭირდება საცალო მერჩანდაიზერები პროდუქტის განთავსებისთვის. საჭიროა ორგანიზებულობა და გუნდური მუშაობა.", skills: [{ skillName: "ორგანიზებულობა", weight: 5 }, { skillName: "ზრუნვა დეტალებზე", weight: 4 }, { skillName: "დროის მართვა", weight: 4 }, { skillName: "გუნდური მუშაობა", weight: 4 }, { skillName: "პროდუქტის განთავსება", weight: 4 }] },
    { id: "fb-accountant", slug: "junior-accountant", title: "ქვემდეგრადული ბუღალტერი", category: "ფინანსები", description: "ვეძებთ ქვემდეგრადულ ბუღალტერს. საჭიროა Excel-ის საფუძვლები და მათემატიკური უნარები.", skills: [{ skillName: "Excel საფუძვლები", weight: 5 }, { skillName: "ზრუნვა დეტალებზე", weight: 5 }, { skillName: "ორგანიზებულობა", weight: 4 }, { skillName: "რიცხვითი უნარები", weight: 5 }, { skillName: "დროის მართვა", weight: 4 }] },
    { id: "fb-office", slug: "office-assistant", title: "ოფისის ასისტენტი", category: "ადმინისტრაცია", description: "ვიყენებთ ოფისის ასისტენტს ადმინისტრაციული მხარდაჭერისთვის. საჭიროა ორგანიზებულობა და კომპიუტერული უნარები.", skills: [{ skillName: "ორგანიზებულობა", weight: 5 }, { skillName: "კომუნიკაცია", weight: 4 }, { skillName: "კომპიუტერის საფუძვლები", weight: 4 }, { skillName: "დროის მართვა", weight: 4 }, { skillName: "საიმედოობა", weight: 4 }] },
    { id: "fb-bartender", slug: "bartender", title: "ბარმენი", category: "სასტუმრო მომსახურება", description: "გვჭირდება ბარმენი სასმელების მომზადებისა და მომხმარებლების მომსახურებისთვის.", skills: [{ skillName: "მომხმარებელთა მომსახურება", weight: 5 }, { skillName: "კომუნიკაცია", weight: 4 }, { skillName: "სიჩქარე და სიზუსტე", weight: 4 }] },
    { id: "fb-line-cook", slug: "line-cook", title: "მზარეული / სამზარეულოს მუშა", category: "სასტუმრო მომსახურება", description: "ვიყენებთ მზარეულებს სამზარეულოში. საჭიროა გუნდური მუშაობა და სისუფთავე.", skills: [{ skillName: "გუნდური მუშაობა", weight: 5 }, { skillName: "სისუფთავე", weight: 5 }, { skillName: "ინსტრუქციების შესრულება", weight: 4 }] },
    { id: "fb-data-entry", slug: "data-entry-clerk", title: "მონაცემთა შემომავალი", category: "ადმინისტრაცია", description: "გვჭირდება მონაცემთა შემომავალი. საჭიროა ზრუნვა დეტალებზე და სიჩქარე.", skills: [{ skillName: "ბეჭდვა", weight: 5 }, { skillName: "ზრუნვა დეტალებზე", weight: 5 }, { skillName: "ორგანიზებულობა", weight: 4 }] },
    { id: "fb-driver", slug: "driver", title: "მძღოლი", category: "ლოგისტიკა", description: "ვეძებთ საიმედო მძღოლებს. საჭიროა ნავიგაცია და დროის მართვა.", skills: [{ skillName: "საიმედოობა", weight: 5 }, { skillName: "დროის მართვა", weight: 5 }, { skillName: "ნავიგაცია", weight: 4 }] },
    { id: "fb-hotel-front", slug: "hotel-front-desk", title: "სასტუმროს მიღების თანამშრომელი", category: "სასტუმრო მომსახურება", description: "გვჭირდება სასტუმროს მიღების თანამშრომლები. საჭიროა მომხმარებელთა მომსახურება.", skills: [{ skillName: "მომხმარებელთა მომსახურება", weight: 5 }, { skillName: "კომუნიკაცია", weight: 5 }, { skillName: "ორგანიზებულობა", weight: 4 }] },
    { id: "fb-nanny", slug: "nanny", title: "ნიანა / ბავშვების მოვლა", category: "მოვლა", description: "ვეძებთ საიმედო ნიანას. საჭიროა მომთმენი და საიმედოობა.", skills: [{ skillName: "მომთმენი", weight: 5 }, { skillName: "კომუნიკაცია", weight: 4 }, { skillName: "საიმედოობა", weight: 5 }] },
    { id: "fb-stock", slug: "stock-associate", title: "საწყობის ასისტენტი", category: "საცალო ვაჭრობა", description: "გვჭირდება საწყობის ასისტენტები. საჭიროა ფიზიკური გამძლეობა და ზრუნვა დეტალებზე.", skills: [{ skillName: "ფიზიკური გამძლეობა", weight: 4 }, { skillName: "ზრუნვა დეტალებზე", weight: 5 }, { skillName: "გუნდური მუშაობა", weight: 4 }] },
    { id: "fb-restaurant-host", slug: "restaurant-host", title: "რესტორანის მასპინძელი", category: "სასტუმრო მომსახურება", description: "ვიყენებთ რესტორანის მასპინძლებს. საჭიროა მომხმარებელთა მომსახურება და ორგანიზებულობა.", skills: [{ skillName: "მომხმარებელთა მომსახურება", weight: 5 }, { skillName: "კომუნიკაცია", weight: 4 }, { skillName: "ორგანიზებულობა", weight: 4 }] },
    { id: "fb-construction", slug: "construction-laborer", title: "სამშენებლო მუშა", category: "მშენებლობა", description: "გვჭირდება სამშენებლო მუშები. საჭიროა ფიზიკური გამძლეობა და უსაფრთხოებაზე ზრუნვა.", skills: [{ skillName: "ფიზიკური გამძლეობა", weight: 5 }, { skillName: "გუნდური მუშაობა", weight: 4 }, { skillName: "უსაფრთხოების ცნობიერება", weight: 5 }] },
    { id: "fb-event-staff", slug: "event-staff", title: "ივენთის თანამშრომელი", category: "სასტუმრო მომსახურება", description: "ვიყენებთ ივენთის თანამშრომლებს. საჭიროა მომხმარებელთა მომსახურება და მოქნილობა.", skills: [{ skillName: "მომხმარებელთა მომსახურება", weight: 5 }, { skillName: "გუნდური მუშაობა", weight: 5 }, { skillName: "მოქნილობა", weight: 3 }] },
    { id: "fb-laundry", slug: "laundry-worker", title: "სტარცხილის მუშა", category: "მომსახურება", description: "გვჭირდება სტარცხილის მუშები. საჭიროა ზრუნვა დეტალებზე და საიმედოობა.", skills: [{ skillName: "ზრუნვა დეტალებზე", weight: 5 }, { skillName: "საიმედოობა", weight: 5 }, { skillName: "ფიზიკური გამძლეობა", weight: 3 }] },
    { id: "fb-handyman", slug: "handyman", title: "უნივერსალური მუშა", category: "მომსახურება", description: "ვეძებთ უნივერსალურ მუშას შეკეთებისთვის. საჭიროა პრობლემის გადაჭრა და საიმედოობა.", skills: [{ skillName: "პრობლემის გადაჭრა", weight: 5 }, { skillName: "საიმედოობა", weight: 5 }, { skillName: "ინსტრუქციების შესრულება", weight: 4 }] },
    { id: "fb-teaching", slug: "teaching-assistant", title: "ასისტენტ მასწავლებელი", category: "განათლება", description: "გვჭირდება ასისტენტი მასწავლებლები. საჭიროა კომუნიკაცია და მომთმენი.", skills: [{ skillName: "კომუნიკაცია", weight: 5 }, { skillName: "მომთმენი", weight: 5 }, { skillName: "ორგანიზებულობა", weight: 4 }] },
  ],
};

export type JobTemplateRole = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  skills: { skillName: string; weight: number }[];
};

/**
 * Average salary by job slug (GEL/month) — from vacancy data.
 * Used when DB JobRoleTemplate doesn't include salary.
 * TODO: compute from Vacancy table when available.
 */
export const AVG_SALARY_BY_SLUG: Record<string, number> = {
  barista: 1200,
  cashier: 1000,
  waiter: 1100,
  "sales-associate": 1200,
  "call-center-agent": 1300,
  "warehouse-worker": 1100,
  receptionist: 1400,
  "delivery-courier": 1000,
  "kitchen-assistant": 900,
  cleaner: 800,
  "security-guard": 1200,
  "pharmacy-assistant": 1500,
  "hotel-housekeeping": 900,
  "retail-merchandiser": 1100,
  "junior-accountant": 1800,
  "office-assistant": 1300,
  bartender: 1100,
  "line-cook": 1000,
  "data-entry-clerk": 950,
  driver: 1100,
  "hotel-front-desk": 1150,
  nanny: 900,
  "stock-associate": 900,
  "restaurant-host": 950,
  "construction-laborer": 1100,
  "event-staff": 900,
  "laundry-worker": 750,
  handyman: 1100,
  "teaching-assistant": 950,
};

const DEFAULT_RECOMMENDED_SALARY = 1100;

/**
 * Get recommended salary (GEL/month) for a job slug.
 * Handles API/CSV slugs (e.g. retail-cashier) by matching to canonical slugs.
 */
export function getRecommendedSalaryForSlug(slug: string | null | undefined): number {
  if (!slug || typeof slug !== "string") return DEFAULT_RECOMMENDED_SALARY;
  const normalized = slug.toLowerCase().trim();
  if (AVG_SALARY_BY_SLUG[normalized] != null) return AVG_SALARY_BY_SLUG[normalized];
  for (const key of Object.keys(AVG_SALARY_BY_SLUG)) {
    if (normalized === key || normalized.endsWith("-" + key) || normalized.startsWith(key + "-"))
      return AVG_SALARY_BY_SLUG[key];
  }
  return DEFAULT_RECOMMENDED_SALARY;
}

/** Turn job title into slug for salary lookup (e.g. "Retail Cashier" → "retail-cashier"). Exported for use with candidate average salaries. */
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s*\/\s*.*$/, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** Get recommended salary (GEL/month) for a job title (e.g. from vacancy list). */
export function getRecommendedSalaryForTitle(title: string | null | undefined): number {
  return getRecommendedSalaryForSlug(title ? titleToSlug(title) : null);
}

/** Get recommended salary (GEL/month) for a job title, using candidate averages when available. */
export function getRecommendedSalaryForTitleWithAverages(
  title: string | null | undefined,
  averagesBySlug: Record<string, number> | null | undefined
): number {
  if (!title) return getRecommendedSalaryForSlug(null);
  const slug = titleToSlug(title);
  if (slug && averagesBySlug && typeof averagesBySlug[slug] === "number")
    return Math.round(averagesBySlug[slug]);
  return getRecommendedSalaryForTitle(title);
}

/**
 * Get skill names from a role (from API/DB or fallback).
 * Prefer this when you have the selected role; skills come from the same source as the role.
 */
export function getSkillNamesFromRole(role: JobTemplateRole | null): string[] {
  return role?.skills?.map((s) => s.skillName) ?? [];
}

/** Get English skill names for a role slug (fallback only — use getSkillNamesFromRole when you have the role). */
export function getSkillsForRoleSlug(slug: string): string[] {
  const role = FALLBACK_TEMPLATES.en.find((r) => r.slug === slug);
  return role ? role.skills.map((s) => s.skillName) : [];
}

export async function fetchJobTemplates(locale: "en" | "ka" = "en"): Promise<JobTemplateRole[]> {
  try {
    const res = await fetch(`/api/job-templates?locale=${locale}`);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    // Use API/DB data whenever we have any roles (seeded job_role_templates)
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {
    // Fallback when DB/API unavailable
  }
  return FALLBACK_TEMPLATES[locale];
}
