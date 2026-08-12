/* eslint-disable prettier/prettier */
/* eslint-disable react/react-in-jsx-scope */
export default function StudentDashboardSkeleton() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 animate-pulse">
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="h-6 w-48 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                <div className="h-6 w-16 bg-gray-300 rounded"></div>
              </div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Profile Skeleton */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6">
            <div className="h-24 bg-gray-200 rounded mb-6"></div>

            <div className="w-24 h-24 bg-gray-300 rounded-xl -mt-12 mb-4"></div>

            <div className="h-6 w-40 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-6"></div>

            <div className="grid grid-cols-2 gap-4">
              {[1,2,3,4,5,6].map((i)=>(
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>

          {/* Attendance Skeleton */}
          <div className="bg-white rounded-xl p-6">
            <div className="h-6 w-32 bg-gray-300 rounded mb-6"></div>

            <div className="w-40 h-40 bg-gray-200 rounded-full mx-auto mb-6"></div>

            <div className="flex justify-between">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
