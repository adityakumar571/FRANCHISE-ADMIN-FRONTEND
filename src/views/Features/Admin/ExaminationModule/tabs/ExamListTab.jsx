/* eslint-disable prettier/prettier */
/**
 * Tab 1 — Exam List
 * Re-uses the existing ExamLists page logic inline so we don't duplicate code.
 * Wraps the existing ExamLists component directly.
 */
import React from 'react'
import ExamLists from '../../ExamsList/ExamLists'

const ExamListTab = () => <ExamLists />

export default ExamListTab
