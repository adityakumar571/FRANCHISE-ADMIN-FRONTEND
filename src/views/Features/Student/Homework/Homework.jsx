/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useContext } from 'react'
import { getRequest } from '../../../../Helpers'
import { AppContext } from '../../../../context/AppContext'
import { BookOpen } from 'lucide-react'
import HomeworkFilter from './HomeworkFilter'
import Loader from '../../../../components/Loading/Loader'
import HomeworkGrid from './HomeworkGrid'

const StudentHomework = () => {
  const { user } = useContext(AppContext)
  const [homeworks, setHomeworks] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    subject: '',
    fromDate: '',
    toDate: '',
  })
  // const fetchHomework = async () => {
  //   try {
  //     setLoading(true)

  //     const classId = user?.profile?.currentClass?._id
  //     const sectionId = user?.profile?.currentSection?._id
  //     const streamId = user?.profile?.currentStream?._id || ''

  //     if (!classId || !sectionId) return

  //     const res = await getRequest(
  //       `homework/student?classId=${classId}&sectionId=${sectionId}&streamId=${streamId}&page=1&limit=10`,
  //     )

  //     if (res?.data?.data?.list) {
  //       setHomeworks(res.data.data.list)
  //     }
  //   } catch (err) {
  //     console.log('Error fetching homework', err)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const fetchHomework = async (appliedFilters = filters) => {
    try {
      setLoading(true)

      const classId = user?.profile?.currentClass?._id
      const sectionId = user?.profile?.currentSection?._id
      const streamId = user?.profile?.currentStream?._id || ''

      if (!classId || !sectionId) return

      let url = `homework/student?classId=${classId}&sectionId=${sectionId}&streamId=${streamId}&page=1&limit=10`

      if (appliedFilters.subject) {
        url += `&subjectId=${appliedFilters.subject}`
      }
      if (appliedFilters.fromDate) {
        url += `&fromDate=${appliedFilters.fromDate}`
      }
      if (appliedFilters.toDate) {
        url += `&toDate=${appliedFilters.toDate}`
      }

      const res = await getRequest(url)

      if (res?.data?.data?.list) {
        setHomeworks(res.data.data.list)
      }
    } catch (err) {
      console.log('Error fetching homework', err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (user) {
      fetchHomework()
    }
  }, [user])

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

  const [subjects, setSubjects] = useState([])

  const fetchSubjects = async () => {
    try {
      const classId = user?.profile?.currentClass?._id
      const streamId = user?.profile?.currentStream?._id || ''

      const res = await getRequest(`subjects?classId=${classId}&streamId=${streamId}`)

      console.log('SUBJECT RES =>', res)

      if (res?.data?.data?.subjects) {
        setSubjects(res.data.data.subjects)
      }
    } catch (err) {
      console.log(err)
    }
  }
  useEffect(() => {
    if (user) {
      fetchSubjects()
    }
  }, [user])

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters)
    fetchHomework(newFilters)
  }
  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="px-4 py-3 bg-white rounded border mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="text-[#e24028]" /> Homework
          </h1>
        </div>
      </div>

      {/* FILTER */}
      <HomeworkFilter subjects={subjects} initialFilters={filters} onApply={handleApplyFilters} />

      {/* LOADER */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader />
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && homeworks.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg font-medium">No Homework Found</p>
          <p className="text-sm">Try changing filters or check later</p>
        </div>
      )}

      {/* HOMEWORK LIST */}
      {!loading && homeworks.length > 0 && (
        <HomeworkGrid homeworks={homeworks} formatDate={formatDate} />
      )}
    </div>
  )
}

export default StudentHomework
