# JobGenie — Enterprise UI/UX Redesign Specification

> **Purpose**: Complete UI specification for every screen in the JobGenie platform, optimized for Google Stitch recreation.  
> **Design Philosophy**: Modern enterprise SaaS — clean, premium, data-rich, accessible.  
> **Target**: 3 portals (Candidate, Employer, MIS Admin) + Public pages + Auth flows.

---

## 🎨 Global Design System

### Color Palette

> 🎨 **Derived from the JobGenie logo**: Forest green background, vibrant lime-green magnifying glass accent, and dark charcoal icon elements.

#### Brand Colors (from logo)
| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--primary` | `#3D7A4F` (Forest Green) | `#5AAE6B` (Soft Forest Green) | CTAs, links, active sidebar states, primary buttons |
| `--primary-hover` | `#2F6140` (Deep Forest) | `#4A9A5B` (Hover Forest Green) | Hover on primary elements |
| `--primary-light` | `#EAF5EC` (Mint Cream) | `#1A3D24` (Dark Forest) | Primary tint backgrounds (10% usage) |
| `--accent` | `#8BC34A` (Lime Green) | `#A4D65E` (Light Lime) | Secondary highlights, progress bars, feature icons, badges |
| `--accent-hover` | `#7CB342` (Dark Lime) | `#8BC34A` | Hover on accent elements |
| `--accent-light` | `#F1F8E9` (Lime Cream) | `#2A3F1C` (Dark Lime Tint) | Accent tint backgrounds |

#### Semantic Colors
| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--success` | `#10B981` (Emerald-500) | `#34D399` (Emerald-400) | Approvals, positive states, verified badges |
| `--warning` | `#F59E0B` (Amber-500) | `#FBBF24` (Amber-400) | Pending status, caution alerts |
| `--danger` | `#EF4444` (Red-500) | `#F87171` (Red-400) | Errors, rejections, destructive actions |
| `--info` | `#0EA5E9` (Sky-500) | `#38BDF8` (Sky-400) | Informational badges, new/unread indicators |

#### Neutral Colors
| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--background` | `#F8FAF9` (Mint-tinted White) | `#0C1A12` (Dark Forest Black) | Page background |
| `--surface` | `#FFFFFF` | `#162B1E` (Deep Green-Black) | Cards, panels, sidebar |
| `--surface-elevated` | `#FFFFFF` | `#1E3A28` (Elevated Green-Black) | Modals, dropdowns, popovers |
| `--border` | `#D8E8DD` (Green-tinted Gray) | `#2A4A34` (Dark Green Border) | Dividers, card borders |
| `--text-primary` | `#1A2E22` (Forest Black) | `#F0F7F2` (Mint White) | Headings, body text |
| `--text-secondary` | `#5A7D66` (Muted Green) | `#8BAF95` (Light Muted Green) | Descriptions, labels |
| `--text-muted` | `#8FAF99` (Soft Sage) | `#5A7D66` (Muted Green) | Hints, placeholders |
| `--charcoal` | `#3A3A3A` (Charcoal) | `#4A4A4A` (Light Charcoal) | Icon fills, dark UI elements (from logo magnifying glass) |

#### Dashboard Accent Colors (for stat cards, category icons)
| Token | Value | Usage |
|-------|-------|-------|
| `--card-blue` | `#2563EB` / 10% bg | Profile card icons, MIS user management |
| `--card-emerald` | `#10B981` / 10% bg | Jobs card icons, candidate approvals |
| `--card-violet` | `#8B5CF6` / 10% bg | Applications card icons, employer management |
| `--card-amber` | `#F59E0B` / 10% bg | Settings card icons, job management |
| `--card-rose` | `#F43F5E` / 10% bg | Danger zone, alerts |
| `--card-teal` | `#14B8A6` / 10% bg | Reports & analytics |

### Typography
| Element | Font | Weight | Size | Line Height |
|---------|------|--------|------|-------------|
| Display | Inter | 700 | 48px / 3rem | 1.1 |
| H1 | Inter | 700 | 36px / 2.25rem | 1.2 |
| H2 | Inter | 600 | 28px / 1.75rem | 1.3 |
| H3 | Inter | 600 | 22px / 1.375rem | 1.4 |
| Body | Inter | 400 | 16px / 1rem | 1.6 |
| Body Small | Inter | 400 | 14px / 0.875rem | 1.5 |
| Caption | Inter | 500 | 12px / 0.75rem | 1.4 |
| Button | Inter | 600 | 14px / 0.875rem | 1 |

### Spacing Scale
`4px / 8px / 12px / 16px / 20px / 24px / 32px / 40px / 48px / 64px / 80px / 96px`

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Inputs, small buttons |
| `--radius-md` | 8px | Cards, badges |
| `--radius-lg` | 12px | Modals, panels |
| `--radius-xl` | 16px | Feature cards, hero sections |
| `--radius-2xl` | 24px | Landing page CTA cards |
| `--radius-full` | 9999px | Avatars, pills, tags |

### Elevation / Shadows
| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Cards at rest |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.08)` | Cards on hover |
| `--shadow-lg` | `0 10px 25px -3px rgba(0,0,0,0.1)` | Modals, floating panels |
| `--shadow-xl` | `0 20px 40px -5px rgba(0,0,0,0.12)` | Popovers |

### Icon System
- **Library**: Lucide React (24px default, 20px inline, 16px compact)
- **Style**: Outlined, 1.5px stroke weight
- **Color**: Inherit from parent text color; primary color for featured icons

### Animation Tokens
| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `--transition-fast` | 150ms | ease-out | Hover states, toggles |
| `--transition-base` | 200ms | ease-in-out | Buttons, inputs |
| `--transition-slow` | 300ms | ease-in-out | Cards, modals |
| `--transition-spring` | 400ms | cubic-bezier(0.34,1.56,0.64,1) | Micro-interactions |

---

## 📄 PAGE 1: Landing Page — Homepage

**Route**: `/`  
**Layout**: Full-width, no sidebar. Sticky header + scrollable sections + footer.

### 1.1 Header (Sticky Navigation Bar)
- **Height**: 64px
- **Background**: `--surface` with `backdrop-blur(12px)` + 60% opacity  
- **Bottom border**: 1px `--border` at 40% opacity
- **Layout** (horizontal, space-between):
  - **Left**: Logo image (height 40px, auto width, border-radius 6px)
  - **Center**: Nav links — "About", "Features", "Contact" — `--text-secondary`, 14px font, hover → `--primary` with underline offset animation
  - **Right**: Theme toggle (sun/moon icon button) + "Login" primary button (filled, `--primary` bg, white text, radius-md)
- **Mobile** (below 768px): Hamburger icon replaces center+right. Opens a slide-down panel with vertical nav links + full-width Login button
- **Sticky behavior**: `position: sticky; top: 0; z-index: 50`

### 1.2 Hero Section
- **Padding**: 80px top/bottom (desktop), 48px (mobile)
- **Max-width**: 1280px centered
- **Content** (centered, text-align center):
  1. **Status Badge**: Pill shape (`--radius-full`), border `--primary` at 20% opacity, bg `--primary` at 5%, text `--primary`. Contains a pulsing green dot (animated ping) + text "Your Gateway to Career Success"
  2. **Headline**: Display font — "Find Your Perfect" (line 1) + "Career Match" (line 2, `--primary` color). 48px desktop / 36px mobile
  3. **Subheadline**: Body text, `--text-secondary`, max-width 640px — "JobGenie connects talented candidates with forward-thinking employers. Whether you're looking for your dream job or the perfect hire, we've got you covered."
  4. **Stats Row**: 4-column grid (2-col on mobile) — each stat has a large number (`--primary`, 36px bold) + label below (`--text-muted`, 14px). Stats: "10K+ Active Jobs", "50K+ Candidates", "5K+ Companies", "95% Success Rate"
  5. **CTA Cards**: 2-column grid below stats (stack on mobile). Each card:
     - Border-radius: 24px, border `--border`, bg `--surface`, padding 40px
     - Hover: border → `--primary` at 50%, shadow-md appears
     - Icon container: 48px square, radius-xl, bg `--primary` at 10%, icon `--primary`
     - Card title: H3, bold — "For Job Seekers" / "For Employers"
     - Description: `--text-secondary`, 1-2 lines
     - Checklist: 4 items, each with a small green checkmark circle (20px) + text
     - CTA Button: Primary filled, "Get Started Free →" / "Start Hiring →" with arrow icon that translates right on hover

### 1.3 Features Section
- **Background**: `--background` with subtle `--border` top border, bg alternating `--surface` at 30% opacity
- **Padding**: 80px vertical
- **Header**: Centered — H2 "Why Choose JobGenie?" with "JobGenie" in `--primary`. Subtext below.
- **Features Grid**: 3-column (2 on tablet, 1 on mobile), gap 32px
  - Each card: `--surface` bg, border `--border`, radius-xl, padding 32px
  - Hover: border → `--primary` at 50%, subtle shadow
  - Icon: 48px container, radius-lg, bg `--primary` at 10% → on hover bg becomes solid `--primary` and icon turns white
  - Title: H3, 20px semibold
  - Description: `--text-secondary`
  - **6 features**: Smart Job Matching (Search icon), Verified Profiles (Shield), Instant Applications (Zap), Talent Pool Access (Users), Analytics Dashboard (BarChart3), Direct Messaging (MessageSquare)

### 1.4 Contact Section
- **Background**: `--background` with subtle tint
- **Header**: Centered H2 "Get in Touch" with "Touch" in `--primary`
- **Contact Cards**: 3-column grid — Email, Phone, Office
  - Each: Centered layout, radius-xl, border, padding 32px, hover border → `--primary`, shadow-md
  - Icon container (48px, radius-lg) with hover animation like Features
  - Title + info text
- **Contact Form**: Max-width 560px, centered below cards
  - Fields: Name + Email (2-col row), Message (textarea, 5 rows)
  - Each input: radius-sm, border `--border`, bg `--background`, padding 12px 16px, focus ring `--primary` at 20%
  - Submit: Full-width primary button "Send Message"

### 1.5 Footer
- **Background**: `--surface` at 30%, top border
- **Layout**: 5-column grid (2 on mobile)
  - Col 1: Logo + tagline
  - Col 2: "Company" — About Us, Contact, Careers
  - Col 3: "For Candidates" — Create Account, Browse Jobs, Career Resources
  - Col 4: "For Employers" — Post a Job, Pricing, Enterprise
  - Col 5: "Legal" — Privacy Policy, Terms of Service, Cookie Policy
- **Bottom bar**: Border-top, flex between — "© 2026 JobGenie. All rights reserved." + social icons (Twitter, LinkedIn)

---

## 📄 PAGE 2: Universal Login Page

**Route**: `/login`  
**Layout**: Centered card on muted background, no header/footer.

### 2.1 Page Container
- Full viewport min-height, `--background` with muted tint (3% opacity overlay)
- Center-aligned both axes

### 2.2 Login Card
- **Width**: max-width 448px
- **Style**: `--surface` bg, border `--border`, radius-2xl (16px), padding 32px, shadow-sm
- **Content** (top to bottom):
  1. **Icon**: Centered — 64px container, radius-2xl, bg `--primary` at 10%, LogIn icon (40px) in `--primary`
  2. **Heading**: H1 "Welcome Back", centered, 24px bold
  3. **Subtext**: "Sign in to your account to continue", `--text-secondary`, centered
  4. **Form**:
     - Email field: Label "Email Address", placeholder "your.email@example.com", type email, autocomplete
     - Password field: Label "Password", placeholder "Enter your password", type password with show/hide toggle button (Eye/EyeOff icon, absolute positioned right)
     - Submit button: Full-width, primary filled, "Sign In" — loading state shows spinner + "Signing in..."
  5. **Separator**: Horizontal line with subtle border
  6. **Signup Links**: Text "Don't have an account?" + 2-column grid of outline buttons:
     - "Sign up as Candidate" → `/candidate/signup`
     - "Sign up as Employer" → `/employer/signup`
  7. **Back link**: Ghost button "← Back to Home" → `/`

---

## 📄 PAGE 3: Candidate Signup Page

**Route**: `/candidate/signup`  
**Layout**: Centered card, muted background.

### 3.1 Signup Card
- **Width**: max-width 512px (slightly wider than login for more fields)
- **Style**: Same card treatment as login
- **Content**:
  1. **Icon**: User icon in primary-tinted container
  2. **Heading**: "Create Your Candidate Account"
  3. **Subtext**: "Join thousands of job seekers finding their dream careers."
  4. **Form Fields**:
     - First Name (text input, required)
     - Last Name (text input, required)
     - Email (email input, required, with real-time validation indicator)
     - Phone Number (tel input, required)
     - Password (password input with show/hide toggle + strength indicator)
       - **Password Strength Bar**: Animated progress bar below password field. Colors: red (weak) → amber (fair) → green (strong). Label shows strength text
       - **Requirements Checklist**: Small list showing ✓ or ✗ for each requirement (min length, uppercase, lowercase, number, special char)
     - Confirm Password (with match validation)
  5. **Submit Button**: Full-width primary — "Create Account" / loading spinner
  6. **Error Display**: Red alert box for server-side errors
  7. **Footer**: "Already have an account? Sign in" link
  8. **Back to Home**: Ghost button with left arrow

---

## 📄 PAGE 4: Employer Signup Page (Multi-Step Wizard)

**Route**: `/employer/signup`  
**Layout**: Wider card (max-width 768px), centered, muted background.

### 4.1 Page Header
- H1 "Employer Registration", centered, 30px bold
- Subtext: "Create your company account and start recruiting talent"

### 4.2 Signup Wizard Component
- **Progress Bar**: Animated horizontal progress bar at top of card showing completion %
- **Step Indicator**: Shows current step number and title

#### Step 1: Company Information
- Company Name (text, required)
- Business Registration Number (text, required)
- Industry (select dropdown)
- Company Website (url input)
- Company Address (textarea)
- Company Description (textarea)

#### Step 2: Employer Profile
- First Name + Last Name (2-col row)
- Email (email, required)
- Phone Number (tel, required)
- Job Title / Designation (text)
- Password + Confirm Password (with strength indicator)

### 4.3 Navigation
- "Back" outline button (left) + "Next" / "Create Account" primary button (right)
- Footer: "Already have an account? Log in here" + "← Back to Home"

---

## 📄 PAGE 5: MIS Admin Registration Page

**Route**: `/mis/register`  
**Layout**: Centered card (max-width 448px).

### 5.1 Conditional Rendering
- **If MIS admin exists**: Show warning alert — yellow-tinted card with AlertCircle icon, title "Registration Not Available", message about contacting system admin, login link
- **If no MIS admin**: Show registration form

### 5.2 Registration Form
- H1 "Create MIS Account"
- Subtext: "Register as a Management Information System user"
- Fields similar to candidate signup: First Name, Last Name, Email, Phone, Password, Confirm Password
- Submit + login link footer

---

## 📄 PAGE 6: Email Verification Page

**Route**: `/candidate/verify-email`, `/employer/verify-email`  
**Layout**: Centered card, muted background.

### 6.1 Verification Card
- **Icon**: Mail icon in primary container
- **Heading**: "Verify Your Email"
- **Message**: "We've sent a verification code to your email"
- **OTP Input**: 6-digit code input, auto-focus, auto-advance between digits
- **Resend Timer**: "Resend code in 00:30" countdown, becomes clickable link when expired
- **Verify Button**: Full-width primary
- **Back link**: "← Back to login"

---

## 📄 PAGE 7: Setup Password Page

**Route**: `/employer/setup-password`, `/mis/setup-password`  
**Layout**: Centered card.

### 7.1 Password Setup Card
- **Icon**: Lock icon in primary container
- **Heading**: "Set Up Your Password"
- **Subtext**: "Create a secure password for your account"
- **Form**: New Password + Confirm Password with strength indicator + requirements checklist
- **Submit**: "Set Password" primary button

---

## 📄 PAGE 8: Candidate Profile Creation Wizard

**Route**: `/candidate/create-profile`  
**Layout**: Max-width 768px, centered. Multi-step wizard with sidebar progress.

### 8.1 Wizard Shell
- **Progress bar**: Top of card, animated, shows % completion
- **Step title**: H2 showing current step name
- **Card container**: `--surface`, border, radius-lg, padding 32px

### 8.2 Steps (up to 10 dynamic steps)

#### Step: CV Upload
- Drag-and-drop zone: Dashed border, radius-lg, 200px height, icon centered
- Accepts PDF/DOC/DOCX
- Shows file name + size after upload
- "Upload" + "Skip" buttons
- AI extraction notice: Info badge explaining auto-fill from CV

#### Step: Basic Information
- Profile photo upload (circular, 120px, with camera overlay icon)
- First Name + Last Name (2-col, pre-filled from registration)
- Email (disabled, pre-filled)
- Phone (pre-filled)
- Date of Birth (date picker with calendar popup)
- Gender (select: Male/Female/Other/Prefer not to say)
- Address (textarea)
- City + Country (2-col, Country as searchable dropdown)
- LinkedIn URL (optional)

#### Step: Industry Selection
- Industry sector dropdown (searchable)
- Sub-industry (conditional dropdown)
- Years of experience (number input)

#### Step: Education
- Repeatable education entries (add/remove)
- Each entry: Institution, Degree, Field of Study, Start Year, End Year, GPA
- "Add Another Education" outline button

#### Step: Banking Education (conditional — for finance/banking industry)
- Academic education entries for banking sector
- Professional qualifications (CFA, FRM, etc.)
- Specialized training programs

#### Step: Finance Education (conditional — for finance industry)  
- Finance-specific certifications and qualifications

#### Step: Experience
- Repeatable work experience entries
- Each: Company Name, Job Title, Start Date, End Date (or "Present"), Description (rich textarea)
- "Add Another Experience" outline button

#### Step: Certifications
- Repeatable certification entries
- Each: Name, Issuing Organization, Issue Date, Expiry Date, Credential ID, URL

#### Step: Projects
- Repeatable project entries
- Each: Project Name, Description, Technologies Used (tag input), URL, Start/End Date

#### Step: Awards
- Repeatable award entries
- Each: Title, Issuer, Date, Description

#### Step: Summary / Review
- Full read-only summary of all entered data displayed in organized sections
- Each section has an "Edit" button to jump back to that step
- "Submit Profile" primary button at bottom

### 8.3 Navigation
- "Previous" outline button (left) + "Next" / "Submit" primary button (right)
- Step progress dots or numbered list in sidebar/top

---

## 📄 PAGE 9: Employer Profile Completion Wizard

**Route**: `/employer/complete-profile`  
**Layout**: Max-width 768px, centered wizard.

### 9.1 Steps

#### Step: Company Details
- Company Logo upload (square, 100px, with overlay)
- Company Name, Registration Number (pre-filled)
- Industry, Website, Address
- Company description (textarea)
- Number of employees (select range)

#### Step: Employer Details
- Profile photo upload
- Designation / Job Title
- Department
- Contact information

### 9.2 BR Certificate Upload
- Drag-and-drop zone for Business Registration certificate
- Accepts PDF/PNG/JPG
- Preview after upload
- Status indicator (pending verification)

---

## 📄 PAGE 10: Candidate Dashboard

**Route**: `/candidate/dashboard`  
**Layout**: Sidebar + Header + Content area (the standard dashboard layout used for all dashboard pages).

### 10.1 Dashboard Layout Shell
This layout applies to ALL candidate dashboard pages:

#### Sidebar (Left, collapsible)
- **Width**: 256px expanded, 64px collapsed
- **Header**: Logo (36px in rounded-lg container) + "JobGenie" text + "Candidate" subtitle (hidden when collapsed)
- **Navigation Items** (vertical list):
  - Dashboard (LayoutDashboard icon)
  - Browse Jobs (Briefcase icon)
  - My Applications (FileText icon)
  - Invitations (Mail icon) — with unread count badge (red dot or number)
  - My Profile (User icon)
  - My Resumes (FileText icon)
  - Settings (Settings icon)
- **Active state**: Background accent color, right border accent (3px green)
- **Hover**: Subtle background highlight
- **Collapsed**: Icons only with tooltip on hover
- **Approval-gated items**: Greyed out with lock icon overlay when user not approved

#### Header (Top bar)
- **Height**: 64px
- **Left**: Sidebar toggle button (PanelLeft icon) + Page title (H2) + Page description (small text, `--text-secondary`)
- **Right**: Theme toggle + User menu dropdown
  - User menu shows: Avatar (40px circle with initials fallback) + name + email
  - Dropdown: "Profile", "Settings", divider, "Sign Out" (red text)

### 10.2 Dashboard Content
- **Approval Status Banner** (conditional):
  - **Pending**: Green-tinted alert — spinning icon + "Our MIS Admin is reviewing your profile..." + "You will be notified once the review is complete."
  - **Approved**: Success alert (auto-dismissible)
  - **Rejected**: Red alert with rejection reason

- **Quick Actions Grid**: 2-col (desktop 3-col) card grid:
  | Card | Icon Color | Icon | Title | Description | CTA |
  |------|-----------|------|-------|-------------|-----|
  | Profile | Blue-500 | User | My Profile | Update your personal information and CV | "View Profile" |
  | Jobs | Green-500 | Briefcase | Browse Jobs | Discover new opportunities | "Find Jobs" |
  | Applications | Purple-500 | FileText | Applications | Track your job applications | "View Applications" |
  | Settings | Orange-500 | Settings | Settings | Manage preferences and notifications | "Settings" |

  Each card: `--surface`, border, radius-xl, padding 24px, hover shadow-md. Icon in 48px container with 10% opacity tint.

---

## 📄 PAGE 11: Candidate Profile View/Edit Page

**Route**: `/candidate/profile`  
**Layout**: Dashboard shell (sidebar + header).

### 11.1 Profile Header
- **Cover area**: Subtle gradient background (primary at 5%)
- **Avatar**: 96px circle (with border), overlaid on cover bottom edge
- **Name**: H1 next to avatar
- **Title/Industry**: `--text-secondary` below name
- **Action buttons**: "Edit Profile" outline button

### 11.2 Profile Sections (tab or vertical sections)
Each section is a Card with header (H3 + Edit icon button) + content:

- **About**: Bio/summary text, basic info (email, phone, location, LinkedIn)
- **Skills**: Tag/badge display — each skill in a pill (`--primary` at 10% bg, `--primary` text, radius-full)
- **Experience**: Timeline layout — each entry shows company, title, dates, description. Vertical line connecting entries
- **Education**: Card list — institution, degree, field, dates, GPA
- **Certifications**: Card list — name, issuer, dates, credential ID
- **Projects**: Card grid — name, description, tech tags, URL link
- **Awards**: Card list — title, issuer, date, description

### 11.3 Edit Dialogs
Each section has a modal dialog for editing:
- Dialog: `--surface-elevated`, radius-lg, shadow-xl, max-width 560px
- Overlay: Black at 50% opacity with blur
- Form fields matching the wizard steps
- Footer: "Cancel" outline + "Save Changes" primary button
- **10 edit dialogs**: About, Basic Info, Experience, Education, Banking Education, Finance Education, Certifications, Projects, Awards, Delete Confirm

---

## 📄 PAGE 12: Candidate Browse Jobs Page

**Route**: `/candidate/jobs`  
**Layout**: Dashboard shell.

### 12.1 Content
- **Page Header**: H2 "Browse Jobs" + description
- **Search/Filter Bar**: Search input + filter dropdowns (Industry, Location, Job Type, Experience Level)
- **Job Listings**: Card list, each showing:
  - Company logo (40px) + Company Name + Location
  - Job Title (H3, bold)
  - Tags: Job type badge, experience level badge, industry badge
  - Salary range (if available)
  - Posted date
  - "Apply" primary button + "Save" outline button
- **Pagination**: Bottom pagination bar

---

## 📄 PAGE 13: Candidate Applications Page

**Route**: `/candidate/applications`  
**Layout**: Dashboard shell.

### 13.1 Content
- **Page Header**: H2 "My Applications"
- **Filter tabs**: All / Pending / Shortlisted / Rejected
- **Applications Table/List**:
  - Columns: Company, Position, Applied Date, Status (badge), Actions
  - Status badges: Pending (amber), Shortlisted (green), Rejected (red), Interview (blue)
  - Actions: "View Details" link

---

## 📄 PAGE 14: Candidate Invitations List Page

**Route**: `/candidate/invitations`  
**Layout**: Dashboard shell.

### 14.1 Content
- **Page Header**: H2 "Job Invitations" + unread count
- **Invitation Cards**: Card list, each showing:
  - Company logo + name
  - Job title + description preview
  - Sent date
  - Status badge: New (blue dot), Viewed, Accepted, Declined
  - Action buttons: "View Details", "Accept" (green), "Decline" (red outline)

---

## 📄 PAGE 15: Candidate Invitation Detail Page

**Route**: `/candidate/invitations/[id]`  
**Layout**: Dashboard shell.

### 15.1 Content
- **Full job details** card with company info header
- **Job Description**: Rich text content
- **Requirements**: Bulleted list
- **Interview scheduling** section (if accepted)
- **Action Bar**: Accept / Decline / Back buttons
- **Chat/Communication Thread**: Message history between candidate and employer

---

## 📄 PAGE 16: Candidate Resumes Page

**Route**: `/candidate/resumes`  
**Layout**: Dashboard shell.

### 16.1 Content
- **Page Header**: H2 "My Resumes"  
- **Upload Area**: Drag-and-drop zone for new resumes
- **Resume List**: Card list of uploaded resumes
  - File icon + filename + file size + upload date
  - Actions: Download, Preview, Delete, "Set as Primary" toggle
  - Primary resume highlighted with badge

---

## 📄 PAGE 17: Candidate Settings Page

**Route**: `/candidate/settings`  
**Layout**: Dashboard shell.

### 17.1 Content
- **Sections** (vertical card stack or tabs):
  - **Account**: Change email, change password
  - **Notifications**: Toggle switches for email notifications
  - **Privacy**: Profile visibility settings
  - **Danger Zone**: Red-bordered card — "Delete Account" with confirmation dialog

---

## 📄 PAGE 18: Employer Dashboard

**Route**: `/employer/dashboard`  
**Layout**: Dashboard shell with Employer sidebar.

### 18.1 Employer Sidebar
Same structure as candidate sidebar with different navigation:
- Dashboard (LayoutDashboard)
- Job Postings (Briefcase)
- Candidates (Users)
- Invitations (FileText)
- Company Profile (Building2)
- My Profile (User)
- Sub-Admins (UserCog)
- Settings (Settings)

With approval-gating on certain items.

### 18.2 Dashboard Content
- **Approval Banner**: Same pattern as candidate (pending/approved/rejected)
- **Stats Grid**: 4-column card grid:
  | Stat | Icon | Title | Subtitle |
  |------|------|-------|----------|
  | Active Jobs | Briefcase | count | "Jobs currently open" |
  | Total Applications | FileText | count | "All time applications" |
  | Shortlisted | Users | count | "Candidates under review" |
  | New Applications | TrendingUp | count | "In the last 7 days" |

  Each stat card: `--surface`, border, radius-md, icon top-right `--text-secondary`

- **Recent Activity Card**: Full-width card with activity timeline or empty state

---

## 📄 PAGE 19: Employer Company Profile Page

**Route**: `/employer/company`  
**Layout**: Dashboard shell.

### 19.1 Content
- **Company Header**: Logo (80px) + Company Name (H1) + Industry tag + Approval status badge
- **Company Info Sections**: 
  - Business Details (registration number, website, address)
  - Description
  - BR Certificate preview + status
- **Edit Company Info Dialog**: Full form modal matching signup wizard fields + logo upload + BR certificate re-upload

---

## 📄 PAGE 20: Employer Candidates Page (Talent Pool)

**Route**: `/employer/candidates`  
**Layout**: Dashboard shell.

### 20.1 Candidate Table
- **Filters**: Search bar + Industry filter + Status filter + Experience range
- **Table**: Sortable columns — Name, Email, Industry, Experience, Status, Skills, Actions
- **Row Actions**: "View Profile" button

### 20.2 Candidate Detail Modal
- Full-screen or large modal (max-width 800px)
- Complete candidate profile view (same sections as candidate profile page)
- "Invite to Apply" primary CTA button
- "Close" button

---

## 📄 PAGE 21: Employer Invitations Page

**Route**: `/employer/invitations`  
**Layout**: Dashboard shell.

### 21.1 Content
- **Invite Candidate Button**: Primary CTA at top — opens search/invite dialog
- **Invitation List/Table**: Sortable by date, status
  - Columns: Candidate Name, Position, Sent Date, Status, Actions
  - Status badges: Sent, Viewed, Accepted, Declined
- **Invite Candidate Dialog**: Search candidates → select → choose job → send invite message

---

## 📄 PAGE 22: Employer Sub-Admins Management Page

**Route**: `/employer/admins`  
**Layout**: Dashboard shell.

### 22.1 Content
- **Page Header**: H2 "Sub-Admin Management" + "Add Sub-Admin" primary button
- **Admin Profiles Table/Cards**: List of sub-administrator accounts
  - Avatar + Name + Email + Role + Status + Last Active
  - Actions: Edit Role, Revoke Access, Resend Invitation

### 22.2 Add Sub-Admin Page (`/employer/admins/add`)
- Form: Email, First Name, Last Name, Role (select dropdown)
- Submit: "Send Invitation" primary button

---

## 📄 PAGE 23: Employer Profile Page

**Route**: `/employer/profile`  
**Layout**: Dashboard shell.

### 23.1 Content
- Similar to candidate profile but for employer personal details
- Profile photo, name, designation, contact info
- Edit dialog for each section

---

## 📄 PAGE 24: MIS Login Page

**Route**: `/mis/login`  
**Layout**: Centered card, similar to universal login.

### 24.1 Content
- MIS-branded header (green/teal accent instead of default primary)
- Login form: Email + Password + Submit
- "Register" link (conditional)

---

## 📄 PAGE 25: MIS Admin Dashboard

**Route**: `/mis/dashboard`  
**Layout**: Dashboard shell with MIS sidebar.

### 25.1 MIS Sidebar
Navigation items:
- Dashboard (LayoutDashboard)
- MIS User Management (Users)
- Candidates (UserSquare)
- Employers (Building2)
- Interviews (Calendar)
- Jobs (Briefcase)
- Reports (BarChart3)
- Settings (Settings)

Subtitle shows "MIS System" under logo.

### 25.2 Dashboard Cards Grid
- 3-column (2 on tablet, 1 on mobile) card grid — each card links to its section:
  | Card | Color | Icon | Title | Count |
  |------|-------|------|-------|-------|
  | MIS User Management | Blue | Users | Manage MIS admins | — |
  | Candidate Approvals | Green | UserSquare | Review candidate profiles | count |
  | Employer Management | Purple | Building2 | Manage employer accounts | count |
  | Job Management | Orange | Briefcase | Oversee job postings | count |
  | Reports & Analytics | Indigo | BarChart3 | View system reports | — |

  Each card: border, radius-lg, padding 24px, hover shadow-md + colored border. Icon in colored tint container. Count displayed as large number top-right.

---

## 📄 PAGE 26: MIS Candidates Management Page

**Route**: `/mis/candidates`  
**Layout**: Dashboard shell.

### 26.1 Candidate Table
- **Filters**: Search + Approval Status filter (All/Pending/Approved/Rejected)
- **Table**: Name, Email, Industry, Profile Completed, Approval Status, Registered Date, Actions
- **Status badges**: Pending (amber), Approved (green), Rejected (red)
- **Actions**: "View Profile", "Approve" (green button), "Reject" (red button)

### 26.2 Candidate Profile View (Slide-over or Detail Page)
- Full profile read-only view
- **Approval Actions Bar**: Fixed bottom bar with "Approve" (green) + "Reject" (red with reason input dialog) + "Revoke" buttons

---

## 📄 PAGE 27: MIS Employers Management Page

**Route**: `/mis/employers`  
**Layout**: Dashboard shell.

### 27.1 Employer Table
- **Filters**: Search + Approval Status + Industry
- **Table**: Company Name, Contact Person, Industry, Approval Status, BR Certificate Status, Actions
- **Actions**: "View Details", "Approve", "Reject"

### 27.2 Employer Profile View
- Company details + BR certificate viewer
- Employer personal info
- Approval action buttons (same pattern as candidates)

---

## 📄 PAGE 28: MIS Interviews Management Page

**Route**: `/mis/interviews`  
**Layout**: Dashboard shell.

### 28.1 Stats Cards Row
- 4 stat cards: Total Interviews, Scheduled, Completed, Cancelled — each with icon + count + subtitle

### 28.2 Interview Table
- **Filters**: Search + Status filter + Date range picker
- **Table**: Candidate, Employer, Position, Date/Time, Status, Actions
- **Status**: Scheduled (blue), Completed (green), Cancelled (red), Rescheduled (amber)
- **Actions**: "View Details", "Reschedule"

### 28.3 Interview Detail View
- Full details: Both parties info, position, date/time, location/link
- Notes section
- Status history timeline
- Action buttons: Reschedule, Cancel, Mark Complete

### 28.4 Reschedule Modal
- Date picker + Time picker + Reason textarea
- "Reschedule" primary button + "Cancel"

---

## 📄 PAGE 29: MIS User Management Page

**Route**: `/mis/users`  
**Layout**: Dashboard shell.

### 29.1 Content
- **Header**: H2 "MIS User Management" + "Add MIS User" primary button
- **Users Table**: Name, Email, Role, Status, Created Date, Actions
- **Actions**: Edit, Deactivate, Reset Password

### 29.2 Add MIS User Page (`/mis/users/add`)
- Form: First Name, Last Name, Email, Role (select), temporary password setup
- Submit: "Create User" primary button

---

## 📄 PAGE 30: Employer Login Page

**Route**: `/employer/login`  
**Layout**: Centered card (same pattern as universal login, but employer-branded).

### 30.1 Content
- Employer-specific heading and icon
- Login form: Email + Password
- Links to employer signup and back to home

---

## 🧩 Shared Component Specifications

### Toast Notifications (Sonner)
- **Position**: Bottom-right
- **Types**: Success (green left border), Error (red), Warning (amber), Info (blue)
- **Animation**: Slide in from right, auto-dismiss after 5s
- **Styling**: `--surface-elevated`, shadow-lg, radius-md

### Alert Dialogs
- Centered modal, overlay blur
- Icon at top (contextual color), Title, Description
- Action buttons: Cancel (outline) + Confirm (filled, contextual color)
- Destructive variant: Red-themed confirm button

### Data Tables
- **Header**: Sticky, `--surface` bg, uppercase labels, 12px font
- **Rows**: Alternating backgrounds (subtle), hover highlight
- **Pagination**: Bottom bar — "Showing X of Y" + page buttons
- **Sorting**: Click headers to sort, arrow indicators
- **Empty state**: Centered icon + message + optional CTA

### Form Elements
- **Inputs**: 44px height, border `--border`, radius-sm, focus ring `--primary`
- **Select**: Custom dropdown with search capability
- **Textarea**: Min 120px height, resizable vertical
- **Checkboxes**: 18px, radius-sm, checked = `--primary` fill
- **Radio buttons**: 18px, `--primary` fill when selected
- **Switches**: 44px wide toggle, `--primary` when on
- **Labels**: 14px, font-weight 500, `--text-primary`, required asterisk in red

### Badges
- **Variants**: Default, Success, Warning, Danger, Info, Outline
- **Size**: 24px height, padding 4px 10px, radius-full, 12px font

### Cards
- `--surface` bg, border `--border`, radius-lg, padding 24px
- Hover: shadow-md transition (200ms)
- Optional: Colored top border (4px) for status indication

### Skeleton Loaders
- Pulsing gray rectangles matching content layout
- Shimmer animation left-to-right

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|-----------|-------|----------------|
| Mobile | < 640px | Single column, sidebar hidden (sheet overlay), stacked cards |
| Tablet | 640–1024px | 2 columns, sidebar collapsed to icons |
| Desktop | 1024–1440px | Full layout, sidebar expanded |
| Wide | > 1440px | Max-width container (1280px), centered |

---

## ♿ Accessibility Requirements

- All interactive elements must have visible focus indicators (2px `--primary` ring)
- Color contrast ratio: minimum 4.5:1 for text, 3:1 for large text
- All images must have descriptive alt text
- Form inputs must have associated labels
- Modals must trap focus and support Escape to close
- Keyboard navigation for all interactive elements (Tab, Enter, Space, Arrow keys)
- Screen reader announcements for dynamic content changes (toast, status updates)
- Reduced motion preference support (`prefers-reduced-motion`)

---

## 🌙 Dark Mode Requirements

- All pages must support seamless dark/light toggle
- Toggle accessible from: Header (landing), User area (dashboards)
- No flash of unstyled content on page load (server-side theme detection)
- All color tokens defined as CSS custom properties with dark mode overrides
- Images/logos should have dark-mode variants or use transparent backgrounds

---

> **Document version**: 1.0  
> **Total interfaces documented**: 30 pages + shared components  
> **Created for**: Google Stitch UI generation  
> **Last updated**: February 15, 2026
