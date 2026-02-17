-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New query → Paste → Run
-- Creates job_role_templates and role_skill_templates, then seeds 16 jobs (EN + KA)

-- Create tables
CREATE TABLE IF NOT EXISTS job_role_templates (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  locale TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  UNIQUE(slug, locale)
);

CREATE TABLE IF NOT EXISTS role_skill_templates (
  id TEXT PRIMARY KEY,
  role_id TEXT NOT NULL REFERENCES job_role_templates(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  weight INTEGER NOT NULL
);

-- Seed job templates (EN + KA) — 16 roles × 2 locales
INSERT INTO job_role_templates (id, slug, locale, title, category, description) VALUES
  ('barista-en', 'barista', 'en', 'Barista', 'Hospitality', 'We are looking for a Barista to prepare coffee and serve customers.'),
  ('barista-ka', 'barista', 'ka', 'ბარისტა', 'სასტუმრო მომსახურება', 'ჩვენ ვეძებთ ბარისტას ყავის მომზადებისა და მომხმარებლების მომსახურებისთვის.'),
  ('cashier-en', 'cashier', 'en', 'Cashier', 'Retail', 'We need a Cashier for point-of-sale and customer service.'),
  ('cashier-ka', 'cashier', 'ka', 'მოლარე', 'საცალო ვაჭრობა', 'გვჭირდება მოლარე კასსა და მომხმარებელთა მომსახურებისთვის.'),
  ('waiter-en', 'waiter', 'en', 'Waiter/Waitress', 'Hospitality', 'We are hiring Waiters/Waitresses for table service.'),
  ('waiter-ka', 'waiter', 'ka', 'მიმტანი', 'სასტუმრო მომსახურება', 'ვიყენებთ მიმტანებს სტუმრების მომსახურებისთვის.'),
  ('sales-associate-en', 'sales-associate', 'en', 'Sales Associate', 'Retail', 'We seek a Sales Associate to assist customers and drive sales.'),
  ('sales-associate-ka', 'sales-associate', 'ka', 'გამყიდველი', 'საცალო ვაჭრობა', 'ვეძებთ გამყიდველს მომხმარებლების დასახმარებლად და გაყიდვების გასაზრდელად.'),
  ('call-center-agent-en', 'call-center-agent', 'en', 'Call Center Agent', 'Customer Service', 'We need Call Center Agents for customer support.'),
  ('call-center-agent-ka', 'call-center-agent', 'ka', 'სატელეფონო ოპერატორი', 'მომხმარებელთა მომსახურება', 'გვჭირდება სატელეფონო ოპერატორები მომხმარებელთა მხარდაჭერისთვის.'),
  ('warehouse-worker-en', 'warehouse-worker', 'en', 'Warehouse Worker', 'Logistics', 'We are hiring Warehouse Workers for packing and logistics.'),
  ('warehouse-worker-ka', 'warehouse-worker', 'ka', 'საწყობის მუშა', 'ლოგისტიკა', 'ვიყენებთ საწყობის მუშებს შეფუთვისა და ლოგისტიკისთვის.'),
  ('receptionist-en', 'receptionist', 'en', 'Receptionist', 'Admin', 'We need a Receptionist for front desk and admin duties.'),
  ('receptionist-ka', 'receptionist', 'ka', 'ადმინისტრატორი', 'ადმინისტრაცია', 'გვჭირდება ადმინისტრატორი მიღებისა და ადმინისტრაციული საქმეებისთვის.'),
  ('delivery-courier-en', 'delivery-courier', 'en', 'Delivery Courier', 'Logistics', 'We are looking for Delivery Couriers.'),
  ('delivery-courier-ka', 'delivery-courier', 'ka', 'კურიერი', 'ლოგისტიკა', 'ვეძებთ კურიერებს.'),
  ('kitchen-assistant-en', 'kitchen-assistant', 'en', 'Kitchen Assistant', 'Hospitality', 'We need Kitchen Assistants to support food prep and cleanliness.'),
  ('kitchen-assistant-ka', 'kitchen-assistant', 'ka', 'სამზარეულოს დამხმარე', 'სასტუმრო მომსახურება', 'გვჭირდება სამზარეულოს დამხმარეები საკვების მომზადებისა და სისუფთავისთვის.'),
  ('cleaner-en', 'cleaner', 'en', 'Cleaner', 'Maintenance', 'We are hiring Cleaners for maintaining our premises.'),
  ('cleaner-ka', 'cleaner', 'ka', 'დამლაგებელი', 'მომსახურება', 'ვიყენებთ დამლაგებლებს ჩვენი ობიექტების სისუფთავისთვის.'),
  ('security-guard-en', 'security-guard', 'en', 'Security Guard', 'Security', 'We seek Security Guards for site safety.'),
  ('security-guard-ka', 'security-guard', 'ka', 'დაცვის თანამშრომელი', 'უსაფრთხოება', 'ვეძებთ დაცვის თანამშრომლებს ობიექტის უსაფრთხოებისთვის.'),
  ('pharmacy-assistant-en', 'pharmacy-assistant', 'en', 'Pharmacy Assistant', 'Healthcare', 'We need a Pharmacy Assistant for customer service and organization.'),
  ('pharmacy-assistant-ka', 'pharmacy-assistant', 'ka', 'აფთიაქის დამხმარე', 'ჯანდაცვა', 'გვჭირდება აფთიაქის დამხმარე მომხმარებელთა მომსახურებისა და ორგანიზებას.'),
  ('hotel-housekeeping-en', 'hotel-housekeeping', 'en', 'Hotel Housekeeping', 'Hospitality', 'We are hiring Hotel Housekeeping staff.'),
  ('hotel-housekeeping-ka', 'hotel-housekeeping', 'ka', 'სასტუმროს დამლაგებელი', 'სასტუმრო მომსახურება', 'ვიყენებთ სასტუმროს დამლაგებლებს.'),
  ('retail-merchandiser-en', 'retail-merchandiser', 'en', 'Retail Merchandiser', 'Retail', 'We need Retail Merchandisers for product placement and displays.'),
  ('retail-merchandiser-ka', 'retail-merchandiser', 'ka', 'საცალო მერჩანდაიზერი', 'საცალო ვაჭრობა', 'გვჭირდება საცალო მერჩანდაიზერები პროდუქტის განთავსებისთვის.'),
  ('junior-accountant-en', 'junior-accountant', 'en', 'Junior Accountant', 'Finance', 'We seek a Junior Accountant. Excel basics and numeracy required.'),
  ('junior-accountant-ka', 'junior-accountant', 'ka', 'ქვემდეგრადული ბუღალტერი', 'ფინანსები', 'ვეძებთ ქვემდეგრადულ ბუღალტერს. საჭიროა Excel-ის საფუძვლები და მათემატიკური უნარები.'),
  ('office-assistant-en', 'office-assistant', 'en', 'Office Assistant', 'Admin', 'We are hiring an Office Assistant for admin support.'),
  ('office-assistant-ka', 'office-assistant', 'ka', 'ოფისის ასისტენტი', 'ადმინისტრაცია', 'ვიყენებთ ოფისის ასისტენტს ადმინისტრაციული მხარდაჭერისთვის.')
ON CONFLICT (slug, locale) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description;

-- Seed skills for barista (example — full seed would add all; run prisma db seed once connection works)
INSERT INTO role_skill_templates (id, role_id, skill_name, weight) VALUES
  ('barista-en-0', 'barista-en', 'Customer service', 5),
  ('barista-en-1', 'barista-en', 'Coffee preparation', 5),
  ('barista-en-2', 'barista-en', 'Speed & accuracy', 4),
  ('barista-en-3', 'barista-en', 'Cash handling', 4),
  ('barista-en-4', 'barista-en', 'Cleanliness', 4),
  ('barista-ka-0', 'barista-ka', 'მომხმარებელთა მომსახურება', 5),
  ('barista-ka-1', 'barista-ka', 'ყავის მომზადება', 5),
  ('barista-ka-2', 'barista-ka', 'სიჩქარე და სიზუსტე', 4),
  ('barista-ka-3', 'barista-ka', 'ნაღდი ფულის მუშაობა', 4),
  ('barista-ka-4', 'barista-ka', 'სისუფთავე', 4)
ON CONFLICT (id) DO NOTHING;
