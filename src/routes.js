import React from 'react'
import AdminDashboard from './views/dashboard/AdminDashboard'
import StudentDashboard from './views/dashboard/StudentDashboard'
import ParentDashboard from './views/dashboard/ParentDashboard'
import TeachersDashboard from './views/dashboard/TeachersDashboard'
import FeeReports from './views/FeeAccount/FeeReports'
import AttendanceManagement from './views/attendance/AttendanceManagement'
import StudentAdmissionForm from './views/admission/StudentAdmissionForm'
import EnrollmentForm from './views/admission/EnrollmentForm'
import StudentTransfer from './views/StudentTransfer/StudentTransfer'
import ReportCard from './views/ReportCard/ReportCard'
import StudentDetailPage from './views/admission/StudentDetailPage'
import ClassMaster from './views/masters/class/ClassMaster'
import SectionMaster from './views/masters/section/SectionMaster'
import DocumentsMaster from './views/masters/documents/DocumentsMaster'
import SessionMaster from './views/masters/session/SessionMaster'
import StreamsMaster from './views/masters/streams/StreamsMaster'
import Demo from './views/Demo'
import RollNumberManage from './views/RollNumberManage/RollNumberManage'
import TeacherRegister from './views/teacher/TeacherRegister'
import TeacherDetailPage from './views/teacher/TeacherDetailPage'
import SubjectMaster from './views/masters/subject/subjectMaster'

// const Dashboard = React.lazy(() => import('./views/dashboard/AdminDashboard'))
import DashboardRouter from './views/dashboard/DashboardRouter'
import CommunicationUI from './views/Communication/Notice'
import StudentDetail from './views/Student/StudentDetail'
import StudentAttendance from './views/Student/studentAttendance/StudentAttendance'
import Marksheet from './views/Student/Marksheet/Marksheet'
import Students from './views/features/Teacher/MyClasses/Student/Student'
import Assignments from './views/features/Teacher/MyClasses/Assignment/Assignment'
import Timetable from './views/features/Teacher/timetable/timetable'
import Leaves from './views/features/Teacher/Leave/Leave'
import Attendance from './views/features/Teacher/MyClasses/Attendence/Attendence'
import ExamsMarks from './views/features/Teacher/ExamsMarks/ExamMarks'
import StudyMaterial from './views/features/Teacher/MyClasses/Materials/Material'
import TeacherDashboard from './views/features/Teacher/Dasboard/Dasboard'
import ExamMaster from './views/masters/Exam/ExamMaster'
import AdminTeachersList from './views/features/Admin/TeacherList/TeacherList'
import Marks from './views/pages/Marks/Marks'
import ExamLists from './views/Features/Admin/ExamsList/ExamLists'
import TeacherDetail from './views/teacherDashboard/TeacherDetail'
import AdminStudentList from './views/Features/Admin/StudentList/StudentList'
import FeesStructure from './views/features/SuperAdmin/FeeManagement/FeeStructure/Feestructure'
import FeesHead from './views/features/SuperAdmin/FeeManagement/FeeHead/FeeHead'
import TeacherAssigned from './views/teacher/TeacherAssigned/TeacherAssigned'
import StudentFeeCollection from './views/Student/fees/StudentFeeCollection'
import StudentFeeCollectionReport from './views/Student/fees/StudentFeeCollectionReport'
import FeeCollection from './views/Features/Admin/FeeCollection/Feecollection'
import ViewMarks from './views/pages/Marks/ViewMarks'
import StudentMarksheet from './views/Features/Student/Marksheet/StudentMarksheet'
import TeacherMarks from './views/Features/Teacher/Marksheet/TeacherMarks'
import TeacherViewMarks from './views/Features/Teacher/Marksheet/TeacherViewMarks'
import FeeInstallmenttype from './views/FeeAccount/FeeInstallmenttype/FeeInstallmenttype'
import FeeHeadwise from './views/Features/Admin/ReportFee/FeeHeadwise/FeeHeadwise'
import OutstandingFees from './views/Features/Admin/ReportFee/OutstandingFees/OutstandingFees'
import DefaultersFee from './views/Features/Admin/ReportFee/DefaultersFee/DefaultersFee'
import FeeLate from './views/masters/feelate/FeeLate'
import LateFeeWavied from './views/Features/Admin/LateFeeWavied/LateFeeWavied'
import AdditionalFeeWaived from './views/Features/Admin/FeeWaived/AdditionalFeeWaived'
import Category from './views/masters/category/Category'
import ClassWiseFee from './views/Features/Admin/ReportFee/ClassWiseFee/ClassWiseFee'
import ExamReport from './views/Features/Admin/ReportFee/ExamReport/ExamReport'
import ResultAnalysis from './views/Features/Admin/ReportFee/ResultAnalysis/ResultAnalysis'
import StudentLedger from './views/Features/Admin/ReportFee/StudentLedger/StudentLedger'
import ReportsHub from './views/Features/Admin/ReportFee/ReportsHub'
import ClassSectionDefaulter from './views/Features/Admin/ReportFee/ClassSectionDefaulter/ClassSectionDefaulter'
import DefaulterDetailed from './views/Features/Admin/ReportFee/DefaulterDetailed/DefaulterDetailed'
import DefaulterMonthWise from './views/Features/Admin/ReportFee/DefaulterMonthWise/DefaulterMonthWise'
import RegistrationFeeStatement from './views/Features/Admin/ReportFee/RegistrationFeeStatement/RegistrationFeeStatement'
import FeeRegisterDetailed from './views/Features/Admin/ReportFee/FeeRegisterDetailed/FeeRegisterDetailed'
import RegistrationFeeClassWise from './views/Features/Admin/ReportFee/RegistrationFeeClassWise/RegistrationFeeClassWise'
import FeeDepositSummaryClassWise from './views/Features/Admin/ReportFee/FeeDepositSummaryClassWise/FeeDepositSummaryClassWise'
import FeeDepositedDetailed from './views/Features/Admin/ReportFee/FeeDepositedDetailed/FeeDepositedDetailed'
import StudentFeeDetailsClassWise from './views/Features/Admin/ReportFee/StudentFeeDetailsClassWise/StudentFeeDetailsClassWise'
import LateFeeWaiverReport from './views/Features/Admin/ReportFee/LateFeeWaiverReport/LateFeeWaiverReport'
import AdditionalFeeWaiverReport from './views/Features/Admin/ReportFee/AdditionalFeeWaiverReport/AdditionalFeeWaiverReport'
import Perfomance from './views/Perfomance/Perfomance'
import RouteMaster from './views/Transport/RouteMaster/RouteMaster'
import StationMaster from './views/Transport/StationMaster/StationMaster'
import BusMaster from './views/Transport/BusMaster.jsx/BusMaster'
import FareSetup from './views/Transport/FareSetup/FareSetup'
import AllocateTransport from './views/Transport/AllocateTransport/AllocateTransport'
import TransReport from './views/Transport/TransportReport/TransReport'
import TransportFeeManage from './views/Transport/TransportManage/TransportFeeManage'
import TransportFeeCollection from './views/Transport/TransportReport/TransportFeeCollection'
import TransportDefaulters from './views/Transport/TransportReport/TransportDefaulters'
import TransportAnalytics from './views/Transport/TransportReport/TransportAnalytics'
import TransportVacation from './views/Transport/TransportVacation/TransportVacation'
import HomeworkAssign from './views/HomworkAssign/HomeworkAssign'
import AdminHomeworkAssign from './views/HomworkAssign/AdminHomeworkAssign'
import Homework from './views/Features/Student/Homework/Homework'
import CreateAdmin from './views/Features/SuperAdmin/CreateAdmin/CreateAdmin'
import SubscriptionPlans from './views/subscriptions/subscriptions'
import StudentIDCard from './views/Features/Admin/idcardGeneration/idCardGeneration'
import DynamicMarsheet from './views/CustomFeatures/DynamicMarsheet/DynamicMarsheet'
import ForgotPassword from './views/pages/ForgotPassword/ForgotPassword'
import ChangePassword from './views/pages/ChangePassword/ChangePassword'
import ClasswiseReport from './views/Features/Admin/ClasswiseReport/Classwisereport'
import SchoolwiseReport from './views/Features/Admin/SchoolwiseReport/SchoolwiseReport'
import AttendanceReport from './views/attendance/AttendanceReport'

// ── HR Module ──
import HRDashboard from './views/HR/HRDashboard'
import DepartmentMaster from './views/HR/Department/DepartmentMaster'
import DesignationMaster from './views/HR/Designation/DesignationMaster'
import StaffList from './views/HR/Staff/StaffList'
import StaffForm from './views/HR/Staff/StaffForm'
import HRUserManagement from './views/HR/HRUsers/HRUserManagement'
import AttendanceEntry    from './views/HR/Attendance/AttendanceEntry'
import AttendanceRegister from './views/HR/Attendance/AttendanceRegister'
import LeaveEntry         from './views/HR/Leave/LeaveEntry'
import LeaveApproval      from './views/HR/Leave/LeaveApproval'
import StaffProfile       from './views/HR/Staff/StaffProfile'
// ── Payroll Module ──
import PayrollDashboard   from './views/HR/Payroll/PayrollDashboard'
import SalaryStructure    from './views/HR/Payroll/SalaryStructure'
import MonthlyPayroll     from './views/HR/Payroll/MonthlyPayroll'
import SalaryPayment      from './views/HR/Payroll/SalaryPayment'
import SalarySlip         from './views/HR/Payroll/SalarySlip'
import PayrollReports     from './views/HR/Payroll/PayrollReports'
import SalarySlipList     from './views/HR/Payroll/SalarySlipList'
// ── Accounts Module ──
import AccountsDashboard  from './views/HR/Accounts/AccountsDashboard'
import AccountHeadMaster  from './views/HR/Accounts/AccountHeadMaster'
import VoucherForm        from './views/HR/Accounts/VoucherForm'
import VoucherList        from './views/HR/Accounts/VoucherList'
import DayBook            from './views/HR/Accounts/DayBook'
import MonthlySummary     from './views/HR/Accounts/MonthlySummary'
import IncomeRegister     from './views/HR/Accounts/IncomeRegister'
import ExpenseRegister    from './views/HR/Accounts/ExpenseRegister'
import AccountLedger      from './views/HR/Accounts/AccountLedger'
// ── HR Reports ──
import HRReports          from './views/HR/Reports/HRReports'
import AttendanceReports  from './views/HR/Reports/AttendanceReports'
// ── Accounts Reports ──
import AnnualReport       from './views/HR/Accounts/AnnualReport'
import PaymentModeReport  from './views/HR/Accounts/PaymentModeReport'

// ── Certificate Module ──
import CertificateListing from './views/Features/Admin/Certificates/CertificateListing'

// ── FAQ Help ──
import FAQHelpPage from './views/Features/FAQ/FAQHelpPage'

// ── Examination Module ──
import ExamListTab from './views/Features/Admin/ExaminationModule/tabs/ExamListTab'
import UpdateMarksTab from './views/Features/Admin/ExaminationModule/tabs/UpdateMarksTab'
import UploadMarksTab from './views/Features/Admin/ExaminationModule/tabs/UploadMarksTab'
import CrossListMarksheetTab from './views/Features/Admin/ExaminationModule/tabs/CrossListMarksheetTab'
import GenerateMarksheetTab from './views/Features/Admin/ExaminationModule/tabs/GenerateMarksheetTab'
import PrintClassWiseTab from './views/Features/Admin/ExaminationModule/tabs/PrintClassWiseTab'
import AdminSupportList from './views/Features/Help&Support.jsx/Help&Support'
import AdminHomeworkList from "./views/HomworkAssign/AdminHomeworkList"
import TeacherHomeWorkList from './views/HomworkAssign/AdminHomeworkList'
import SchoolSettings from './views/Features/Admin/SchoolSettings/SchoolSettings'
import AssignFreeTrial from './views/Features/SuperAdmin/FreeTrialAssign/AssignFreeTrial'
const routes = [
  {
    path: '/dashboard',
    element: DashboardRouter,
    roles: ['SuperAdmin', 'Admin', 'Teacher', 'Student', 'Parent', 'HRManager', 'HRStaff'],
  },
  {
    path: '/support',
    element: AdminSupportList,
    roles: ['SuperAdmin', 'Admin', 'Teacher', 'Student', 'Parent', 'HRManager', 'HRStaff'],
  },
  {
    path: '/faq',
    element: FAQHelpPage,
    roles: ['SuperAdmin', 'Admin', 'Teacher', 'Student', 'Parent'],
  },
  {
    path: '/perfomacereport',
    element: Perfomance,
    roles: ['SuperAdmin', 'Admin'],
  },
  {
    path: '/fee/feesStructure',
    element: FeesStructure,
    roles: ['SuperAdmin', 'Admin'],
  },

  {
    path: '/FeeManagement/FeesHead',
    element: FeesHead,
    roles: ['SuperAdmin', 'Admin'],
  },

  {
    path: '/fee/feescollection',
    element: FeeCollection,
    roles: ['Admin'],
  },
  {
    path: '/FeeManagement/FeeLate',
    element: FeeLate,
    roles: ['SuperAdmin'],
  },
  {
    path: '/fee/feesreport',
    element: FeeReports,
    roles: ['Admin'],
  },
  {
    path: '/fee/late-fee-wavied',
    element: LateFeeWavied,
    roles: ['Admin'],
  },
  {
    path: '/fee/additional-fee-waived',
    element: AdditionalFeeWaived,
    roles: ['Admin'],
  },
  {
    path: '/reports/late-fee-waiver',
    element: LateFeeWaiverReport,
    roles: ['Admin'],
  },
  {
    path: '/reports/additional-fee-waiver',
    element: AdditionalFeeWaiverReport,
    roles: ['Admin'],
  },
  {
    path: '/reports/feeheadreport',
    element: FeeHeadwise,
    roles: ['Admin'],
  },
  {
    path: '/reports',
    element: ReportsHub,
    roles: ['Admin'],
  },
  {
    path: '/reports/class-section-defaulter',
    element: ClassSectionDefaulter,
    roles: ['Admin'],
  },
  {
    path: '/reports/defaulter-detailed',
    element: DefaulterDetailed,
    roles: ['Admin'],
  },
  {
    path: '/reports/defaulter-monthwise',
    element: DefaulterMonthWise,
    roles: ['Admin'],
  },
  {
    path: '/reports/registration-fee-statement',
    element: RegistrationFeeStatement,
    roles: ['Admin'],
  },
  {
    path: '/reports/fee-register-detailed',
    element: FeeRegisterDetailed,
    roles: ['Admin'],
  },
  {
    path: '/reports/registration-fee-classwise',
    element: RegistrationFeeClassWise,
    roles: ['Admin'],
  },
  {
    path: '/reports/fee-deposit-summary-classwise',
    element: FeeDepositSummaryClassWise,
    roles: ['Admin'],
  },
  {
    path: '/reports/fee-deposited-detailed',
    element: FeeDepositedDetailed,
    roles: ['Admin'],
  },
  {
    path: '/reports/student-fee-details-classwise',
    element: StudentFeeDetailsClassWise,
    roles: ['Admin'],
  },
  {
    path: '/reports/defaulterfees',
    element: DefaultersFee,
    roles: ['Admin'],
  },
  {
    path: '/reports/outstandingfees',
    element: OutstandingFees,
    roles: ['Admin'],
  },
  {
    path: '/reports/examreport',
    element: ExamReport,
    roles: ['Admin'],
  },
  {
    path: '/reports/classwiseexamreport',
    element: ClasswiseReport,
    roles: ['Admin'],
  },
  {
    path: '/reports/schoolwiseexamreport',
    element: SchoolwiseReport,
    roles: ['Admin'],
  },
  {
    path: '/reports/result-analysis',
    element: ResultAnalysis,
    roles: ['Admin'],
  },
  {
    path: '/reports/studentLedger',
    element: StudentLedger,
    roles: ['Admin'],
  },

  {
    path: '/change-password',
    element: ChangePassword,
    roles: ['Student'],
  },



  {
    path: '/reports/classwisefees',
    element: ClassWiseFee,
    roles: ['Admin'],
  },
  {
    path: '/student/admission',
    element: StudentAdmissionForm,
    roles: ['Admin'],
  },
  {
    path: '/student/enrollment',
    element: EnrollmentForm,
    roles: ['Admin'],
  },
  {
    path: '/student/studentlist',
    element: AdminStudentList,
    roles: ['Admin'],
  },

  {
    path: '/student/studenttransfer',
    element: StudentTransfer,
    roles: ['Admin'],
  },
  {
    path: '/student/enrollment/:id',
    element: StudentDetailPage,
    roles: ['Admin'],
  },

  {
    path: '/attendance',
    element: AttendanceManagement,
    roles: ['Admin', 'Teacher', ''],
  },
  {
    path: '/attendanceReport',
    element: AttendanceReport,
    roles: ['Admin', 'Teacher',],
  },


  {
    path: '/reportcard',
    element: ReportCard,
    roles: ['Admin', 'Teacher'],
  },
  {
    path: '/examsLists',
    element: ExamLists,
    roles: ['Admin'],
  },
  {
    path: '/marks',
    element: Marks,
    roles: ['Admin'],
  },
  // {
  //   path: '/marks/viewMarks/:id',
  //   element: ViewMarks,
  //   roles: ['Admin'],
  // },
  {
    path: '/marks/viewMarks/:id',
    element: DynamicMarsheet,
    roles: ['Admin'],
  },
  {
    path: '/master/class',
    element: ClassMaster,
    roles: ['SuperAdmin'],
  },
  {
    path: '/master/category',
    element: Category,
    roles: ['SuperAdmin'],
  },
  {
    path: '/master/subject',
    element: SubjectMaster,
    roles: ['SuperAdmin'],
  },
  {
    path: '/master/section',
    element: SectionMaster,
    roles: ['SuperAdmin'],
  },
  {
    path: '/master/documents',
    element: DocumentsMaster,
    roles: ['SuperAdmin'],
  },
  {
    path: '/master/session',
    element: SessionMaster,
    roles: ['SuperAdmin'],
  },
  {
    path: '/master/streams',
    element: StreamsMaster,
    roles: ['SuperAdmin'],
  },
  {
    path: '/create-admin',
    element: CreateAdmin,
    roles: ['SuperAdmin'],
  },

  {
    path: '/master/exam',
    element: ExamMaster,
    roles: ['SuperAdmin'],
  },
  {
    path: '/master/exam',
    element: ExamMaster,
    roles: ['SuperAdmin'],
  },
  {
    path: '/master/feesInstallment',
    element: FeeInstallmenttype,
    roles: ['SuperAdmin', 'Admin'],
  },
  {
    path: '/rollnumber',
    element: RollNumberManage,
    roles: ['Admin', 'Teacher'],
  },

  {
    path: '/teacher/register',
    element: TeacherRegister,
    roles: ['Admin'],
  },

  {
    path: '/teacher/list',
    element: AdminTeachersList,
    roles: ['Admin'],
  },
  {
    path: '/teacher/assignedClass',
    element: TeacherAssigned,
    roles: ['Admin', 'Teacher'],
  },

  {
    path: '/teacher/register/:id',
    element: TeacherDetailPage,
    roles: ['Admin'],
  },
  {
    path: '/communication',
    element: CommunicationUI,
    roles: ['Admin', 'Teacher', 'Student'],
  },

  /* Only Student */
  {
    path: '/studentdetail/:studentId',
    element: StudentDetail,
    roles: ['Student'],
  },
  {
    path: '/studentattendance/:studentId',
    element: StudentAttendance,
    roles: ['Student'],
  },
  {
    path: '/student-marksheet',
    element: StudentMarksheet,
    roles: ['Student'],
  },

  {
    path: '/StudentFeeCollection/:studentId',
    element: StudentFeeCollection,
    roles: ['Student'],
  },

  {
    path: '/StudentFeeCollectionReport/:studentId',
    element: StudentFeeCollectionReport,
    roles: ['Student'],
  },

  /* ================= TEACHER ================= */

  {
    path: '/TeacherDashboard',
    element: TeacherDashboard,
    roles: ['Teacher'],
  },

  {
    path: '/TeacherDetailPage/:teacherId',
    element: TeacherDetail,
    roles: ['Teacher'],
  },
  {
    path: 'homework',
    element: Homework,
    roles: ['Student'],
  },

  {
    path: '/teacher/my-classes/students',
    element: Students, // new
    roles: ['Teacher'],
  },
  {
    path: '/teacher/add-marks',
    element: TeacherMarks, // new
    roles: ['Teacher'],
  },
  {
    path: '/techer/marks/viewMarks/:id',
    element: TeacherViewMarks, // new
    roles: ['Teacher'],
  },

  {
    path: '/teacher/my-classes/attendance',
    element: Attendance, // new
    roles: ['Teacher'],
  },

  {
    path: '/teacher/my-classes/assignments',
    element: Assignments, // new
    roles: ['Teacher'],
  },

  {
    path: '/teacher/my-classes/materials',
    element: StudyMaterial, // new
    roles: ['Teacher'],
  },

  {
    path: '/teacher/exams-marks',
    element: ExamsMarks,
    roles: ['Teacher'],
  },

  {
    path: '/teacher/report-card',
    element: ReportCard,
    roles: ['Teacher'],
  },

  {
    path: '/teacher/timetable',
    element: Timetable,
    roles: ['Teacher'],
  },

  {
    path: '/teacher/leave',
    element: Leaves,
    roles: ['Teacher'],
  },

  //transport
  {
    path: '/transport/route',
    element: RouteMaster,
    roles: ['Admin'],
  },
  {
    path: '/transport/station',
    element: StationMaster,
    roles: ['Admin'],
  },
  {
    path: '/transport/bus',
    element: BusMaster,
    roles: ['Admin'],
  },
  {
    path: '/transport/fare',
    element: FareSetup,
    roles: ['Admin'],
  },
  {
    path: '/transport/allocate',
    element: AllocateTransport,
    roles: ['Admin'],
  },
  {
    path: '/transport/reports',
    element: TransReport,
    roles: ['Admin'],
  },
  {
    path: '/transport/fee-manage',
    element: TransportFeeManage,
    roles: ['Admin'],
  },
  {
    path: '/transport/fee-collection',
    element: TransportFeeCollection,
    roles: ['Admin'],
  },
  {
    path: '/transport/defaulters',
    element: TransportDefaulters,
    roles: ['Admin'],
  },
  {
    path: '/transport/analytics',
    element: TransportAnalytics,
    roles: ['Admin'],
  },
  {
    path: '/transport/vacation',
    element: TransportVacation,
    roles: ['Admin'],
  },

  {
    path: '/homeworklist',
    element: TeacherHomeWorkList,
    roles: ['Teacher'],
  },


  {
    path: '/teacher/assigment',
    element: HomeworkAssign,
    roles: ['Teacher'],
  },
  {
    path: '/admin/homework/assign',
    element: AdminHomeworkAssign,
    roles: ['Admin'],

  },
  {
    path: '/admin/homeworklist',
    element: AdminHomeworkList,
    roles: ['Admin'],

  },


  {
    path: '/subscriptions',
    element: SubscriptionPlans,
    roles: ['SuperAdmin', 'Admin'],
  },
  {
    path: '/id-card-generator',
    element: StudentIDCard,
    roles: ['Admin'],
  },

  // ── Examination Management ──
  {
    path: '/examination/exam-list',
    element: ExamListTab,
    roles: ['Admin'],
  },
  {
    path: '/examination/update-marks',
    element: UpdateMarksTab,
    roles: ['Admin'],
  },
  {
    path: '/examination/upload-marks',
    element: UploadMarksTab,
    roles: ['Admin'],
  },
  {
    path: '/examination/cross-list',
    element: CrossListMarksheetTab,
    roles: ['Admin'],
  },
  {
    path: '/examination/marksheet',
    element: GenerateMarksheetTab,
    roles: ['Admin'],
  },
  {
    path: '/examination/print-classwise',
    element: PrintClassWiseTab,
    roles: ['Admin'],
  },
  // ── Certificates ──
  {
    path: '/certificates',
    element: CertificateListing,
    roles: ['Admin'],
  },
  // ── School Settings (SuperAdmin only) ──
  {
    path: '/school-settings',
    element: SchoolSettings,
    roles: ['SuperAdmin'],
  },
  // ── Assign Free Trial to School (SuperAdmin only) ──
  {
    path: '/assign-free-trial',
    element: AssignFreeTrial,
    roles: ['SuperAdmin'],
  },

  // ── HR Module ──
  {
    path: '/hr/dashboard',
    element: HRDashboard,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  {
    path: '/hr/departments',
    element: DepartmentMaster,
    roles: ['Admin', 'SuperAdmin', 'HRManager'],
  },
  {
    path: '/hr/designations',
    element: DesignationMaster,
    roles: ['Admin', 'SuperAdmin', 'HRManager'],
  },
  {
    path: '/hr/staff',
    element: StaffList,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  {
    path: '/hr/staff/add',
    element: StaffForm,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  {
    path: '/hr/staff/edit/:id',
    element: StaffForm,
    roles: ['Admin', 'SuperAdmin', 'HRManager'],
  },
  {
    path: '/hr/users',
    element: HRUserManagement,
    roles: ['Admin', 'SuperAdmin'],
  },
  // ── HR Attendance ──
  {
    path: '/hr/attendance',
    element: AttendanceEntry,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  {
    path: '/hr/attendance/register',
    element: AttendanceRegister,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  // ── HR Leave ──
  {
    path: '/hr/leave',
    element: LeaveEntry,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  {
    path: '/hr/leave/approval',
    element: LeaveApproval,
    roles: ['Admin', 'SuperAdmin', 'HRManager'],
  },
  // ── Staff Profile ──
  {
    path: '/hr/staff/:id',
    element: StaffProfile,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  // ── Payroll Module ──
  {
    path: '/hr/payroll/dashboard',
    element: PayrollDashboard,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  {
    path: '/hr/payroll/salary-structure',
    element: SalaryStructure,
    roles: ['Admin', 'SuperAdmin', 'HRManager'],
  },
  {
    path: '/hr/payroll/monthly',
    element: MonthlyPayroll,
    roles: ['Admin', 'SuperAdmin', 'HRManager'],
  },
  {
    path: '/hr/payroll/payments',
    element: SalaryPayment,
    roles: ['Admin', 'SuperAdmin', 'HRManager'],
  },
  {
    path: '/hr/payroll/payment',
    element: SalaryPayment,
    roles: ['Admin', 'SuperAdmin', 'HRManager'],
  },
  {
    path: '/hr/payroll/slip',
    element: SalarySlipList,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  {
    path: '/hr/salary-slip/:id',
    element: SalarySlip,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  {
    path: '/hr/payroll/reports',
    element: PayrollReports,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  // ── Accounts Module ──
  {
    path: '/hr/accounts/dashboard',
    element: AccountsDashboard,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  {
    path: '/hr/accounts/heads',
    element: AccountHeadMaster,
    roles: ['Admin', 'SuperAdmin', 'HRManager'],
  },
  // Voucher new — both paths work
  {
    path: '/hr/accounts/voucher/new',
    element: VoucherForm,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  {
    path: '/hr/accounts/voucher',
    element: VoucherForm,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  {
    path: '/hr/accounts/vouchers',
    element: VoucherList,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  // Day Book — both paths work
  {
    path: '/hr/accounts/day-book',
    element: DayBook,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  {
    path: '/hr/accounts/daybook',
    element: DayBook,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  // Monthly Summary — both paths work
  {
    path: '/hr/accounts/monthly',
    element: MonthlySummary,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  {
    path: '/hr/accounts/summary',
    element: MonthlySummary,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  // Income Register
  {
    path: '/hr/accounts/income-register',
    element: IncomeRegister,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  // Expense Register
  {
    path: '/hr/accounts/expense-register',
    element: ExpenseRegister,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  // Account Ledger
  {
    path: '/hr/accounts/ledger',
    element: AccountLedger,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  // ── HR Reports ──
  {
    path: '/hr/reports/staff',
    element: HRReports,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  {
    path: '/hr/reports/attendance',
    element: AttendanceReports,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  {
    path: '/hr/reports/payroll',
    element: PayrollReports,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  {
    path: '/hr/reports/salary-slip',
    element: SalarySlipList,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  // ── Accounts Reports ──
  {
    path: '/hr/accounts/annual',
    element: AnnualReport,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
  {
    path: '/hr/accounts/payment-mode',
    element: PaymentModeReport,
    roles: ['Admin', 'SuperAdmin', 'HRManager', 'HRStaff'],
  },
]

export default routes
