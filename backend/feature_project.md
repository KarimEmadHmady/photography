# Build a Complete Wedding Photography Portfolio Website with an Admin Dashboard

Act as a senior full-stack software engineer and UI/UX designer. Your task is to plan, implement, and test a complete, production-ready wedding photography portfolio website with a secure admin dashboard.

The website belongs to a wedding photographer who specializes in wedding sessions, bride-and-groom photography, outdoor locations, luxury venues, printed photo albums, wall art, wedding videos, and reels.

The photographer must be able to manage all dynamic website content through the admin dashboard without editing code.

**Important:** Before implementing anything, inspect the existing repository, identify the current framework versions, understand the existing project structure, and review the existing code and configuration. If the repository already contains an application, preserve its working functionality and follow its existing conventions where appropriate. Do not unnecessarily recreate the project or introduce unrelated changes.

---

## 1. Technology Stack

Use the following technologies:

### Frontend
- Next.js with the App Router.
- React.
- JavaScript or TypeScript according to the existing repository conventions. If starting from scratch, use TypeScript for better maintainability.
- Tailwind CSS for styling.
- A suitable icon library such as Lucide React.
- Next.js Image component for optimized image rendering.
- React Hook Form and Zod, or an equivalent consistent solution, for form validation.
- Use server components where appropriate and client components only when interactivity is required.

### Backend
- Node.js.
- Express.js.
- MongoDB.
- Mongoose.
- REST API architecture.
- Zod, Joi, or an equivalent validation library for incoming requests.

### Image Storage
- Cloudinary for all uploaded portfolio images and service images.
- Store Cloudinary public IDs and relevant image metadata in MongoDB.
- Never expose Cloudinary API secrets in frontend code.

### Project Architecture
Keep the Next.js frontend and Express backend logically separated.

If the repository is new, use either two separate applications or a well-organized monorepo with separate frontend and backend applications. Choose the simplest maintainable structure and document how to run both applications.

Do not create a second backend inside Next.js. Express is the primary backend API.

---

## 2. Website Language and General Requirements

The entire public website and admin dashboard must use Arabic.

Requirements:
- Arabic-only user interface.
- RTL layout throughout the application.
- Correct Arabic typography and readable font sizes.
- Responsive design for mobile, tablet, and desktop.
- Excellent performance and accessibility.
- Clear loading, success, error, empty, and confirmation states.
- No unnecessary registration system for public visitors.
- No booking form, calendar, online payment, or appointment management system.
- Visitors contact the photographer directly through WhatsApp or phone calls.
- There is only one administrator account.
- The admin dashboard must be protected by authentication and authorization.

Use Egyptian Arabic naturally where appropriate for customer-facing copy, but keep interface labels clear, professional, and consistent.

---

## 3. Core Content Hierarchy

This is the most important business requirement. Implement the following three-level hierarchy correctly.

### Level 1: Regions / Areas

Examples:
- مدينة نصر
- مصر الجديدة
- الزمالك
- التجمع الخامس
- المعادي

These are broad geographical areas used to organize photography locations.

Each region contains:
- Arabic name.
- URL slug.
- Short description, optional.
- Cover image.
- Optional SEO title and description.
- Display order.
- Publication status.
- Creation and update timestamps.

The region listing page displays these regions as attractive image cards.

Example card:
- Region cover image.
- Region name.
- Optional short description.
- A button or clickable area to explore the region.

Clicking a region opens its details/listing page containing all photography locations assigned to that region.

### Level 2: Photography Locations

Each region can contain multiple individual photography locations.

Example:

Region: مدينة نصر

Locations inside that region:
- حديقة الطفل - مدينة نصر
- قلعة صلاح الدين الأيوبي
- فندق راماج - التجمع الخامس

Important data-modeling note: the examples above are illustrative. Each location must be assigned to its actual region, and the administrator must be able to assign any location to any region. Do not hardcode these examples or force every example into مدينة نصر.

Other examples:

Region: مصر الجديدة
- حديقة الميريلاند
- حديقة غرناطة
- Any additional locations entered by the administrator.

Region: الزمالك
- Any locations added through the dashboard.

Every location must belong to a region through a MongoDB reference, such as regionId.

Each location card should include:
- Main cover image.
- Location name.
- Short description.
- Optional starting price or a clear price summary.
- A button such as "عرض التفاصيل".
- Optional badge, such as "مميز", if enabled by the administrator.

The locations listing page should support filtering by region and sensible sorting.

Each location must have its own SEO-friendly URL.

Recommended routes:

- /regions
- /regions/[regionSlug]
- /locations/[locationSlug]

Alternatively, the region page can use a nested route such as /regions/[regionSlug]/locations if this improves the existing routing structure.

Regardless of the exact URL structure, every location must have a stable, unique slug and its own details page.

### Level 3: Location Details Page

Clicking a location opens a complete details page for that specific photography location.

Example:

/locations/child-park-nasr-city

The page should include:

1. Breadcrumb navigation:
   الرئيسية ← المناطق ← مدينة نصر ← حديقة الطفل

2. Main cover image or a large hero image.

3. Location name.

4. Detailed description.

5. Full address and location information.

6. Optional Google Maps link or directions link, configurable through the dashboard.

7. Photography price.

8. Venue reservation price.

9. An optional total estimated cost, calculated only when both component prices are known and the administrator enables displaying the total.

10. A responsive photo gallery.

11. Additional photography services.

12. WhatsApp contact button.

13. Phone call button.

14. Related locations, optionally selected by the administrator or automatically chosen from the same region.

15. SEO metadata and social sharing metadata.

The photography price and venue reservation price must be stored and displayed separately.

Example:

- سعر التصوير: ١٥٠٠ جنيه
- سعر حجز المكان: ٥٠٠ جنيه

These are illustrative prices only. Never hardcode these values.

Allow the administrator to specify whether a price is fixed, starting from a certain amount, or available upon request.

If a price is unavailable, do not display misleading values such as zero. Display a suitable label such as "السعر حسب الاتفاق" or hide the price according to the administrator's settings.

---

## 4. Location Photo Gallery

Each photography location must support a flexible gallery.

Requirements:
- No fixed five-image limit.
- The administrator can upload any reasonable number of images.
- The administrator can choose the main cover image.
- The administrator can reorder gallery images using drag and drop.
- The administrator can add, replace, and delete individual images.
- The gallery should be responsive and visually polished.
- Clicking an image opens a lightbox.
- Visitors can navigate between images.
- Mobile visitors can navigate comfortably.
- Images should have meaningful Arabic alternative text when appropriate.
- Use optimized image sizes and responsive Cloudinary transformations.

The cover image should preferably reference an existing gallery asset rather than require an unnecessary duplicate upload.

However, the data model should allow a dedicated cover image when needed.

Store image references using Cloudinary public IDs, URLs, and sort order.

When replacing or deleting images, handle Cloudinary cleanup safely. Do not delete a Cloudinary image that is still referenced by another entity.

Avoid orphaned images where practical, and implement appropriate cleanup handling for failed database operations.

---

## 5. Additional Services

The administrator must be able to create, edit, publish, unpublish, reorder, and delete additional services from the dashboard.

Examples:
- ألبومات الصور المطبوعة.
- التابلوهات وإطارات الصور.
- فيديوهات الأفراح.
- ريلز الأفراح.
- تصوير إضافي.
- أي خدمة مستقبلية يضيفها المصور.

Do not hardcode the service catalog.

Each service should support:
- Arabic name.
- Slug.
- Short description.
- Full description, if needed.
- Main image.
- Optional gallery.
- Optional price.
- Price type: fixed, starting from, or upon request.
- Active/inactive status.
- Draft/published status.
- Display order.
- Optional external video URL.
- Optional dimensions or product variants, where relevant.
- SEO metadata when a dedicated service page exists.
- Created and updated timestamps.

### Service Visibility and Relationships

The administrator should control where each service appears:

- Homepage.
- Dedicated services page.
- Specific photography location pages.
- Multiple locations.
- All locations, when appropriate.

Use a clear relationship model, such as a locationIds array and a visibility setting.

Avoid duplicating the same service document for every location.

If the administrator wants a location-specific price override, implement it only if necessary and model it explicitly rather than silently changing the global service price.

### Dedicated Services Page

Create a dedicated services page if it improves content organization.

Recommended route:
- /services
- /services/[serviceSlug], when individual service details justify a dedicated page.

The homepage should also display selected services when enabled by the administrator.

---

## 6. Homepage Design and Content

The homepage should feel like a premium wedding photography portfolio, not a generic business landing page.

Build the following sections:

### A. Header and Navigation
- Photographer logo or name.
- الرئيسية.
- المناطق.
- الخدمات.
- أعمالنا, if implemented as a separate portfolio/gallery section.
- تواصل معنا.
- A prominent WhatsApp contact button.
- Responsive mobile navigation.

### B. Hero Section
- Large, beautiful wedding photography image.
- Elegant Arabic headline.
- Short introductory description.
- Primary CTA: "استكشف أماكن التصوير".
- Secondary CTA: "تواصل عبر واتساب".

All hero text, images, and button destinations should be editable through the dashboard.

### C. About the Photographer
- Short biography.
- Optional profile image.
- Photography style and experience.
- Optional social media links.

Allow the administrator to update this content.

### D. Featured Regions
Display selected regions as attractive image cards.

The administrator must be able to:
- Choose which regions appear.
- Change their display order.
- Hide or show this section.
- Set the section title and description.

### E. Featured Locations
Display selected photography locations with their cover images and clear calls to action.

Do not duplicate region cards and location cards without a clear distinction.

### F. Portfolio / Selected Work
Display a curated selection of wedding photography images.

Allow the administrator to select the images shown in this section.

If implementing a separate portfolio collection is unnecessary for the first version, allow the homepage to reference selected location gallery images without duplicating image records.

### G. Additional Services
Show selected services such as albums, wall art, wedding videos, and reels.

### H. How It Works
Explain the contact process in a few simple steps:
1. Choose a photography location.
2. Explore the images and prices.
3. Contact the photographer through WhatsApp or phone.
4. Coordinate the details directly.

Do not imply that a booking has been confirmed online.

### I. Contact Section
- Phone number.
- WhatsApp.
- Instagram.
- Facebook.
- Other optional social links.

### J. Footer
- Photographer name or logo.
- Quick links.
- Contact details.
- Social media.
- Copyright text.
- Optional privacy notice.

The administrator should be able to enable or disable homepage sections and change their order without requiring code changes.

Do not implement a complex drag-and-drop page builder. A simple section configuration with enabled flags, display order, and editable content is sufficient.

---

## 7. Admin Dashboard

Create a dedicated, authenticated Arabic RTL admin dashboard.

Recommended routes:

- /admin/login
- /admin
- /admin/regions
- /admin/locations
- /admin/services
- /admin/homepage
- /admin/settings

The exact routes can follow existing project conventions.

### A. Dashboard Overview

Display useful summary cards:
- Total regions.
- Total locations.
- Published locations.
- Draft locations.
- Total active services.

Optional: show recently updated locations and quick actions.

Avoid irrelevant financial charts or booking analytics because the system does not process payments or manage appointments.

### B. Region Management

Full CRUD operations:
- Create region.
- Edit region.
- View region details.
- Delete region with confirmation.
- Upload and replace cover image.
- Change display order.
- Publish/unpublish.
- Edit slug and description.
- View the number of associated locations.

When deleting a region that still has locations, do not silently delete the associated locations. Prevent the operation or require the administrator to reassign or explicitly handle those locations.

### C. Location Management

Full CRUD operations:
- Create location.
- Edit location.
- View location.
- Delete location with confirmation.
- Select its parent region.
- Upload cover image.
- Manage gallery images.
- Set image order.
- Set address and optional map link.
- Set photography price.
- Set venue reservation price.
- Set price types and availability.
- Add and edit description.
- Select related services.
- Choose featured status.
- Choose publication status.
- Change display order.
- Configure SEO metadata.
- Preview the public page.

The location form must clearly distinguish the region from the individual location.

For example:

Region: مدينة نصر

Location: حديقة الطفل - مدينة نصر

These are separate entities, not interchangeable labels.

### D. Service Management

Full CRUD operations for additional services.

Support:
- Image upload.
- Optional gallery.
- Optional price.
- Service type or category.
- Optional external video URL.
- Homepage visibility.
- Location associations.
- Display order.
- Publication status.
- Preview before publishing.

### E. Homepage Content Management

Allow the administrator to edit:
- Photographer name.
- Logo.
- Hero title.
- Hero description.
- Hero images.
- Hero buttons and their destinations.
- About section.
- Featured regions.
- Featured locations.
- Selected portfolio images.
- Featured services.
- Section titles and descriptions.
- Section visibility.
- Section ordering.
- Contact details.
- Social links.

### F. General Settings

Include:
- Website name.
- Photographer name.
- Phone number.
- WhatsApp number.
- Default WhatsApp message.
- Instagram URL.
- Facebook URL.
- Other optional social links.
- Currency label, defaulting to Egyptian pounds.
- Default SEO title.
- Default SEO description.
- Optional favicon and logo.
- Footer content.

Validate phone numbers and URLs appropriately.

---

## 8. Data Modeling with MongoDB and Mongoose

Design maintainable schemas with proper indexes, validation, timestamps, and relationships.

Suggested collections:

### Admin
Fields:
- email, unique and normalized.
- passwordHash.
- createdAt.
- updatedAt.
- Optional lastLoginAt.

Never store plaintext passwords.

There must be no public admin registration route.

Create the initial administrator through a secure seed script or another documented setup process.

### Region
Fields:
- name.
- slug, unique.
- description.
- coverImage.
- seoTitle.
- seoDescription.
- status: draft or published.
- sortOrder.
- timestamps.

### Location
Fields:
- regionId, referencing Region.
- name.
- slug, unique.
- shortDescription.
- description.
- address.
- optional mapUrl.
- coverImage.
- gallery array containing image metadata.
- photographyPrice.
- venuePrice.
- optional total price display setting.
- price types and availability settings.
- relatedServiceIds.
- isFeatured.
- status: draft or published.
- sortOrder.
- SEO fields.
- timestamps.

Use a deliberate schema for prices. Avoid ambiguous fields that mix numbers, strings, and booleans without validation.

For example, a price can have an amount and a pricing type. If the price type is "upon request", the amount may be null.

### Service
Fields:
- name.
- slug.
- shortDescription.
- description.
- mainImage.
- gallery.
- optional videoUrl.
- optional price object.
- optional product variants or dimensions.
- visibility configuration.
- locationIds, when applicable.
- isFeatured.
- status.
- sortOrder.
- SEO fields.
- timestamps.

### SiteSettings
Use a singleton document for the website configuration.

Fields:
- photographer information.
- logo and favicon.
- hero configuration.
- about section.
- homepage sections and ordering.
- featured region IDs.
- featured location IDs.
- selected portfolio images or references.
- featured service IDs.
- contact information.
- social media links.
- default SEO settings.
- footer settings.

Do not duplicate entire region, location, or service objects in SiteSettings. Store references or stable identifiers.

### Schema Design Rules
- Use unique indexes for slugs.
- Use ObjectId references where appropriate.
- Validate all required relationships.
- Avoid unbounded embedded documents for independent content entities.
- Use timestamps.
- Handle missing or deleted references safely.
- Document important schema decisions.

Do not add booking, payment, subscription, or multi-tenant collections because they are outside the project scope.

---

## 9. Express REST API

Create a clean, versioned REST API.

Recommended prefix:
`/api/v1`

### Authentication
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- GET /api/v1/auth/me

Implement secure authentication using an established approach.

Prefer secure, HttpOnly, Secure-in-production, SameSite cookies or another well-justified secure session strategy. If using cookies, configure CORS, credentials, and CSRF protection appropriately.

Do not store authentication tokens in localStorage unless there is a compelling, documented security reason.

### Public Region Endpoints
- GET /api/v1/regions
- GET /api/v1/regions/:slug

Only published regions should appear publicly.

### Public Location Endpoints
- GET /api/v1/locations
- GET /api/v1/locations/:slug
- Optional featured and related location queries.

Support filtering by region, pagination when appropriate, and deterministic sorting.

Only published locations belonging to published regions should be visible publicly.

### Public Service Endpoints
- GET /api/v1/services
- GET /api/v1/services/:slug

Return only services that should be publicly visible.

### Public Settings
- GET /api/v1/settings/public

Return only public settings. Never expose admin information, password hashes, secrets, or private configuration.

### Admin Region Endpoints
- POST /api/v1/admin/regions
- PATCH /api/v1/admin/regions/:id
- DELETE /api/v1/admin/regions/:id

Include GET endpoints for listing and retrieving administrative data.

### Admin Location Endpoints
- POST /api/v1/admin/locations
- PATCH /api/v1/admin/locations/:id
- DELETE /api/v1/admin/locations/:id

Include administrative listing, detail, and filtering endpoints.

### Admin Service Endpoints
- POST /api/v1/admin/services
- PATCH /api/v1/admin/services/:id
- DELETE /api/v1/admin/services/:id

Include administrative listing and detail endpoints.

### Admin Homepage and Settings Endpoints
- GET /api/v1/admin/settings
- PATCH /api/v1/admin/settings
- GET /api/v1/admin/homepage
- PATCH /api/v1/admin/homepage

Implement additional endpoints for image uploads and gallery ordering when required.

Use appropriate HTTP status codes and consistent response formats.

---

## 10. Cloudinary Upload Architecture

Implement secure image upload functionality.

Requirements:
- Configure Cloudinary credentials exclusively on the backend.
- Support multiple image uploads.
- Validate MIME types and file sizes.
- Use generated or controlled upload paths.
- Generate optimized image URLs.
- Preserve public IDs for deletion.
- Support image replacement and gallery ordering.
- Return useful upload errors.
- Prevent unauthorized users from uploading or deleting images.
- Avoid orphaned uploads when a database operation fails.
- Avoid deleting assets that are still referenced elsewhere.

Prefer signed direct uploads for larger galleries if implemented correctly, with the Express backend generating the upload signature after verifying administrator authentication.

Alternatively, use backend-mediated uploads for the initial version if that is simpler and reliable.

Document the required Cloudinary environment variables.

---

## 11. Security Requirements

Security is mandatory, even though there is only one administrator.

Implement:
- Secure password hashing using Argon2id or bcrypt.
- Login validation.
- Rate limiting on authentication endpoints.
- Secure session or cookie configuration.
- Server-side authorization for every admin API route.
- Input validation and sanitization.
- Protection against NoSQL injection.
- Appropriate CORS configuration.
- Security headers using Helmet.
- Safe error handling.
- Request body size limits.
- Safe file upload validation.
- Protection against brute-force login attempts.
- Environment variable validation.
- No secrets in frontend bundles.
- No public admin registration.
- No exposure of internal stack traces in production.

The frontend hiding an admin button or page is not sufficient. Express must independently reject unauthorized write requests.

Implement CSRF protection when the chosen cookie-based authentication strategy requires it.

Document how to create the initial admin account and how to rotate its password.

---

## 12. UI/UX Design Direction

Use a premium, elegant wedding photography aesthetic.

The visual style should communicate romance, luxury, professionalism, and trust.

Suggested design direction:
- Warm ivory and off-white backgrounds.
- Charcoal or deep brown typography.
- Muted gold or champagne accents.
- Generous whitespace.
- Large editorial wedding photography.
- Elegant Arabic typography.
- Minimal borders and subtle shadows.
- Tasteful transitions and micro-interactions.
- Beautiful responsive image grids.
- Refined cards and buttons.

These are starting guidelines, not rigid requirements. Choose a coherent palette that complements the photography.

Avoid:
- Generic SaaS dashboard aesthetics on the public website.
- Excessive gradients.
- Overly rounded cards everywhere.
- Excessive animation.
- Tiny text.
- Cluttered sections.
- Heavy components that slow down the site.

### Public Website
The public website should prioritize images and storytelling.

Use:
- Full-width or editorial hero layouts.
- Consistent image ratios.
- Elegant galleries.
- Clear Arabic typography.
- Distinct region and location cards.
- Strong contact CTAs.
- Responsive layouts.

### Admin Dashboard
The dashboard should prioritize usability.

Use:
- RTL sidebar.
- Clear page titles.
- Breadcrumbs.
- Tables or responsive lists.
- Search and filters.
- Pagination where needed.
- Consistent forms.
- Image previews.
- Drag-and-drop image sorting.
- Confirmation dialogs for destructive operations.
- Toast notifications.
- Loading indicators.
- Empty states.
- Error states.

Use accessible contrast, keyboard navigation, visible focus indicators, and semantic HTML.

Do not sacrifice usability for decoration.

---

## 13. Homepage and Location SEO

Implement SEO from the beginning.

Requirements:
- Arabic page titles and descriptions.
- Unique metadata for every published region, location, and service.
- Canonical URLs where appropriate.
- Open Graph metadata.
- Social sharing image metadata.
- XML sitemap.
- robots.txt.
- Meaningful image alt text.
- Clean, stable slugs.
- Correct heading hierarchy.
- Internal links between regions and their locations.
- Breadcrumbs.
- Structured data only where appropriate and factually supported.

The homepage and published region/location pages should be indexable.

Do not expose draft pages in public listings or the sitemap.

Use server-rendered or statically generated content where appropriate, with a reliable revalidation strategy when the administrator changes published content.

If cached public pages are used, make sure dashboard edits and publication changes become visible without requiring unreliable manual server restarts.

Do not invent customer reviews, ratings, business credentials, or photography awards.

---

## 14. Performance and Image Optimization

Image quality and loading speed are critical.

Implement:
- Next.js Image optimization where appropriate.
- Cloudinary transformations.
- Responsive image widths.
- Lazy loading for below-the-fold images.
- Priority loading only for genuinely important above-the-fold images.
- Explicit image dimensions or aspect ratios.
- Lightweight client-side JavaScript.
- Pagination or sensible result limits for large lists.
- Avoid unnecessary database queries.
- Appropriate MongoDB indexes.
- Loading skeletons where useful.
- Proper caching and revalidation.

Avoid loading every gallery image in full resolution immediately.

Do not preload all images or mark every image as high priority.

Test the mobile experience and avoid layout shifts while images load.

---

## 15. Admin Content Workflow

The intended administrator workflow is:

1. Log in.
2. Create a region such as مدينة نصر.
3. Upload a region cover image.
4. Publish the region.
5. Create a location such as حديقة الطفل - مدينة نصر.
6. Assign the location to مدينة نصر.
7. Upload the location cover image and gallery.
8. Reorder the gallery and select the main image.
9. Enter the address and description.
10. Set the photography price and venue reservation price separately.
11. Select applicable services.
12. Preview the location page.
13. Save as draft or publish.
14. Verify the published page.
15. Edit or archive the location later without editing source code.

The same workflow must work for any future region, location, or service added through the dashboard.

Do not hardcode the example regions or locations in frontend components or API handlers.

---

## 16. Error Handling and Data Integrity

Handle:
- Missing regions.
- Missing locations.
- Invalid slugs.
- Duplicate slugs.
- Deleted references.
- Invalid prices.
- Failed image uploads.
- Failed database writes.
- Invalid Cloudinary IDs.
- Unauthorized requests.
- Expired sessions.
- Network errors.
- Empty galleries.
- Unpublished content.
- Attempts to delete regions with associated locations.

Provide helpful Arabic messages in the interface without exposing internal server errors.

Use proper server-side logging.

For destructive operations, request confirmation and clearly explain the impact.

Ensure a failed operation does not silently leave the database and Cloudinary in an inconsistent state.

---

## 17. Testing Requirements

Add meaningful tests for critical behavior.

At minimum, test:
- Authentication success and failure.
- Unauthorized admin API access.
- Region creation and validation.
- Region slug uniqueness.
- Location creation and region assignment.
- Public visibility rules.
- Draft content exclusion.
- Location pricing validation.
- Service visibility rules.
- Invalid request handling.
- Deletion constraints for regions with associated locations.
- Homepage settings validation.

Test the important user journeys:

### Public Journey
Homepage → Region listing → Region details → Location card → Location details → Gallery → WhatsApp or phone contact.

### Admin Journey
Login → Create region → Create location → Upload images → Configure prices → Preview → Publish → Verify public page → Edit content → Delete or archive safely.

Use automated tests where practical and perform a production build.

Do not claim that tests pass unless they were actually executed.

---

## 18. Environment Variables and Documentation

Provide an `.env.example` file containing placeholder values for required configuration, such as:

- MongoDB connection string.
- Express backend port.
- Frontend API base URL.
- Frontend site URL.
- Admin/session authentication secrets.
- Cloudinary cloud name.
- Cloudinary API key.
- Cloudinary API secret.
- Allowed frontend origin.
- Node environment.

Use names that are consistent with the existing project.

Never commit actual credentials.

Document:
- Installation.
- Local development.
- Running frontend and backend.
- Creating the initial administrator.
- MongoDB setup.
- Cloudinary setup.
- Environment variables.
- Testing.
- Production deployment.
- How to update the website through the dashboard.

Do not assume frontend and backend can share environment variables automatically. Configure each application explicitly.

---

## 19. Implementation Strategy

Work in small, verifiable phases.

### Phase 1: Repository Inspection and Architecture
- Inspect the current repository.
- Identify existing code and framework versions.
- Confirm whether the project is new or existing.
- Propose the final folder structure.
- Finalize the data model and API design.
- Identify risks and dependencies.

### Phase 2: Backend Foundation
- Configure Express.
- Configure MongoDB and Mongoose.
- Implement models and indexes.
- Implement authentication.
- Implement validation and centralized error handling.
- Implement protected admin routes.
- Implement public read endpoints.

### Phase 3: Cloudinary
- Configure uploads.
- Implement image metadata storage.
- Implement image deletion and replacement safely.
- Test multiple-image uploads.

### Phase 4: Public Website
- Implement shared layout and RTL.
- Implement homepage.
- Implement regions listing.
- Implement region details.
- Implement locations listing and filtering.
- Implement location details.
- Implement gallery and lightbox.
- Implement services pages and sections.
- Implement contact links and SEO.

### Phase 5: Admin Dashboard
- Implement login.
- Implement dashboard overview.
- Implement region CRUD.
- Implement location CRUD.
- Implement gallery management.
- Implement service CRUD.
- Implement homepage content management.
- Implement general settings.
- Implement preview and publication workflow.

### Phase 6: Testing and Production Readiness
- Run automated tests.
- Run linting and type checks where configured.
- Run production builds.
- Verify public routes and protected routes.
- Verify mobile responsiveness.
- Verify image optimization.
- Verify database integrity.
- Fix any regressions.
- Update documentation.

Adapt this sequence when dependencies require a different order, but do not skip critical validation or security steps.

---

## 20. Final Acceptance Criteria

The project is complete only when the following conditions are satisfied:

1. The website is fully Arabic and RTL.
2. The homepage is polished, responsive, and image-focused.
3. Regions are independent entities managed through the dashboard.
4. Each region contains its assigned photography locations.
5. Each location has its own details page.
6. Each location has an independent cover image and flexible gallery.
7. Photography prices and venue reservation prices are separate.
8. Services are dynamically manageable.
9. The homepage content is editable through the dashboard where specified.
10. All dynamic CRUD operations persist to MongoDB.
11. Images upload to Cloudinary successfully.
12. The dashboard is protected by server-side authentication.
13. Public users can access only published content.
14. Draft and unpublished content remain hidden from public pages.
15. WhatsApp and phone links work correctly.
16. SEO metadata is generated for public pages.
17. The site performs well on mobile devices.
18. Destructive operations and image deletion are handled safely.
19. Tests and production builds are executed and their actual results are reported.
20. Documentation and `.env.example` are provided.
21. No unnecessary booking, payment, or multi-user permission system is introduced.
22. No important feature is represented by a nonfunctional placeholder.

## Final Instructions

Start by inspecting the repository and reporting the existing architecture and any important constraints.

Then produce a concise implementation plan and proceed with implementation.

If the repository is new, create the project structure and implement the complete application.

If the repository already contains an application, preserve existing functionality and make targeted changes.

Do not stop after producing mockups, a design proposal, or static frontend pages. Implement the actual backend, database integration, authentication, CRUD operations, image management, and frontend workflows.

Do not claim a feature is complete unless it is implemented and verified.

At the end, provide:
- A summary of the implementation.
- The final project structure.
- The available routes and API endpoints.
- Environment variables required.
- Setup and run commands.
- Tests and builds executed, including failures.
- Any remaining limitations or tasks that require external credentials or manual configuration.