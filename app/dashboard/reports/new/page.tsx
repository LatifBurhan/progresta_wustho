import ReportForm from '@/components/reports/ReportForm'

export default function NewReportPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Buat Laporan Baru
        </h1>
        <p className="text-gray-600 mt-1">
          Laporkan progress pekerjaan Anda untuk periode ini
        </p>
      </div>
      
      <ReportForm />
    </div>
  )
}