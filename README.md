# Employee Progress Tracker

A high-performance, mobile-first Progressive Web Application for managing 2-hourly employee progress reports, built with Next.js and Supabase.

## Features

### 🚀 Core Functionality
- **2-hourly Progress Reports**: Employees can submit detailed progress reports every 2 hours
- **Multi-Project Support**: Each report can contain multiple projects with individual progress and issues
- **Automatic Attendance Tracking**: Clock-in/out based on first and last reports of the day
- **Overtime Detection**: Automatically detects overtime work after 16:00 WIB
- **Photo Documentation**: Upload and compress photos for report documentation

### 👥 User Management & Roles
- **Role-based Access Control**: Karyawan, PM, and CEO roles with different permissions
- **Division Management**: Organize employees into divisions (Web, Mobile, Design, AI Team, etc.)
- **Approval Workflow**: New users require PM approval before accessing the system
- **Division-based Privacy**: Users can see their own reports and division reports

### 📱 Mobile-First Design
- **Progressive Web App**: Fully installable with offline capabilities
- **Responsive Design**: Optimized for mobile devices with thumb-friendly buttons
- **Infinite Scroll Feed**: Mobile-optimized feed for browsing reports
- **Touch-friendly Interface**: Large buttons and intuitive navigation

### 🔧 Technical Features
- **Real-time Updates**: Live data synchronization with Supabase
- **Image Compression**: Client-side image optimization before upload
- **Auto-save Drafts**: Automatic draft saving to prevent data loss
- **WhatsApp Integration**: Copy formatted reports for WhatsApp sharing
- **Jakarta Timezone**: All timestamps in Asia/Jakarta (GMT+7)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Icons**: Lucide React
- **PWA**: next-pwa with service workers
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd employee-progress-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `database/schema.sql`
   - Create a storage bucket named `report-photos`
   - Configure Row Level Security policies

4. **Environment Configuration**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses the following main tables:

- **users**: User profiles with roles and division assignments
- **divisions**: Company divisions (Web, Mobile, Design, etc.)
- **projects**: Client projects that employees work on
- **project_assignments**: Many-to-many relationship between users and projects
- **reports**: Main report entries with period, location, and future plans
- **report_details**: Individual project progress within each report

## User Roles & Permissions

### Karyawan (Employee)
- Submit progress reports
- View own reports and division reports
- Read-only access to all divisions feed

### PM (Project Manager)
- All Karyawan permissions
- Approve new user registrations
- Manage user roles and divisions
- Create and manage projects
- Full cross-division visibility
- Identify reports with issues (red warning icons)

### CEO
- All PM permissions
- Full system access
- Cross-division analytics

## Report Structure

Each report contains:
- **Period**: 08-10, 10-12, 13-15, 15-17
- **Location**: Al-Wustho, WFA (Work From Anywhere), Client Site
- **Projects**: Multiple projects with individual progress and issues
- **Future Plan**: Plans for the next period
- **Photo**: Optional documentation photo
- **Automatic Timestamps**: All in Jakarta timezone

## PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Service worker caching for core functionality
- **Push Notifications**: (Future enhancement)
- **Background Sync**: (Future enhancement)

## Development

### Project Structure
```
├── app/                    # Next.js app directory
├── components/            # Reusable React components
├── contexts/              # React contexts (Auth, etc.)
├── lib/                   # Utility functions and configurations
├── database/              # SQL schema and migrations
├── public/                # Static assets and PWA files
└── types/                 # TypeScript type definitions
```

### Key Components
- **AuthContext**: Manages user authentication state
- **ReportForm**: Multi-project report creation form
- **ReportFeed**: Infinite scroll feed with filtering
- **UserManagement**: PM interface for user approval and management
- **Navigation**: Mobile-first navigation with bottom tabs

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Supabase Configuration
- Enable Row Level Security on all tables
- Configure storage policies for report photos
- Set up email templates for user registration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile devices
5. Submit a pull request

## License

This project is proprietary software for internal company use.

## Support

For technical support or feature requests, contact the development team.