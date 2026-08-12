import React from 'react';
import { Users, UserCheck, FileText, ClipboardList, Calendar, AlertCircle, TrendingUp, BookOpen } from 'lucide-react';

// ==================== Dashboard.jsx ====================
const TeacherDashboard = () => {
  // Summary Stats
  const stats = [
    { 
      id: 1, 
      title: 'Total Students', 
      value: '125', 
      icon: Users, 
      color: 'bg-blue-500',
      change: '+5 this month'
    },
    { 
      id: 2, 
      title: 'Today\'s Attendance', 
      value: '92%', 
      icon: UserCheck, 
      color: 'bg-green-500',
      change: '115/125 present'
    },
    { 
      id: 3, 
      title: 'Pending Assignments', 
      value: '8', 
      icon: FileText, 
      color: 'bg-orange-500',
      change: 'Due this week'
    },
    { 
      id: 4, 
      title: 'Leave Requests', 
      value: '4', 
      icon: ClipboardList, 
      color: 'bg-purple-500',
      change: 'Pending approval'
    },
  ];

  // Today's Classes
  const todayClasses = [
    { time: '08:00 AM', class: '8A', subject: 'Mathematics', room: 'R-101', status: 'upcoming' },
    { time: '09:30 AM', class: '8B', subject: 'Mathematics', room: 'R-102', status: 'upcoming' },
    { time: '11:00 AM', class: '9A', subject: 'Algebra', room: 'R-101', status: 'upcoming' },
    { time: '02:00 PM', class: '10B', subject: 'Mathematics', room: 'R-103', status: 'upcoming' },
  ];

  // Recent Activities
  const recentActivities = [
    { id: 1, type: 'assignment', text: 'New assignment submitted by Rahul Kumar (8A)', time: '10 mins ago' },
    { id: 2, type: 'leave', text: 'Leave request from Neha Singh (8A)', time: '30 mins ago' },
    { id: 3, type: 'attendance', text: 'Attendance marked for Class 8A', time: '1 hour ago' },
    { id: 4, type: 'exam', text: 'Marks uploaded for Mid-Term Exam', time: '2 hours ago' },
  ];

  // Low Attendance Alerts
  const lowAttendanceStudents = [
    { roll: '02', name: 'Neha Singh', class: '8A', attendance: 68 },
    { roll: '15', name: 'Priya Sharma', class: '8B', attendance: 65 },
    { roll: '22', name: 'Vikram Rao', class: '9A', attendance: 70 },
  ];

  // Upcoming Exams
  const upcomingExams = [
    { subject: 'Mathematics', class: '8A', date: '22 Jan', type: 'Unit Test' },
    { subject: 'Algebra', class: '9A', date: '25 Jan', type: 'Mid-Term' },
    { subject: 'Mathematics', class: '10B', date: '28 Jan', type: 'Final' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Classes */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar size={24} className="text-blue-600" />
                Today's Classes
              </h2>
              <span className="text-sm text-gray-500">Thursday, 16 Jan 2026</span>
            </div>
            <div className="space-y-3">
              {todayClasses.map((cls, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-800">{cls.time}</p>
                      <p className="text-xs text-gray-500">{cls.room}</p>
                    </div>
                    <div className="h-12 w-px bg-gray-300"></div>
                    <div>
                      <p className="font-semibold text-gray-800">{cls.subject}</p>
                      <p className="text-sm text-gray-600">Class {cls.class}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                    Start Class
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Exams */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BookOpen size={24} className="text-purple-600" />
              Upcoming Exams
            </h2>
            <div className="space-y-3">
              {upcomingExams.map((exam, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-800">{exam.subject}</p>
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                      {exam.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-gray-600">Class {exam.class}</p>
                    <p className="text-gray-500">{exam.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Attendance Alert */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <AlertCircle size={24} className="text-red-600" />
              Low Attendance Alert
            </h2>
            <div className="space-y-3">
              {lowAttendanceStudents.map((student) => (
                <div key={student.roll} className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">{student.name}</p>
                    <p className="text-sm text-gray-600">Roll {student.roll} • Class {student.class}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{student.attendance}%</p>
                    <p className="text-xs text-gray-600">Attendance</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp size={24} className="text-green-600" />
              Recent Activities
            </h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'assignment' ? 'bg-blue-100' :
                    activity.type === 'leave' ? 'bg-orange-100' :
                    activity.type === 'attendance' ? 'bg-green-100' :
                    'bg-purple-100'
                  }`}>
                    {activity.type === 'assignment' && <FileText size={18} className="text-blue-600" />}
                    {activity.type === 'leave' && <ClipboardList size={18} className="text-orange-600" />}
                    {activity.type === 'attendance' && <UserCheck size={18} className="text-green-600" />}
                    {activity.type === 'exam' && <BookOpen size={18} className="text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{activity.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;