/* eslint-disable prettier/prettier */
/**
 * DataTable — reusable table wrapper with loading, empty and pagination states
 */
import { Empty, Pagination } from 'antd'
import Loader from '../../../components/Loading/Loader'

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  total = 0,
  page = 1,
  limit = 20,
  onPageChange,
  onLimitChange,
  emptyText = 'No records found',
}) => (
  <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
    <div style={{ overflowX: 'auto' }}>
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <Loader />
          <p style={{ marginTop: 12, fontSize: 13, color: '#9ca3af' }}>Loading records…</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {columns.map((col, i) => (
                <th
                  key={i}
                  style={{
                    padding: '10px 14px',
                    textAlign: col.align || 'left',
                    fontWeight: 600,
                    color: '#374151',
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                    width: col.width,
                  }}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '48px 16px' }}>
                  <Empty description={emptyText} />
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  style={{
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      style={{
                        padding: '10px 14px',
                        textAlign: col.align || 'left',
                        color: '#374151',
                        verticalAlign: 'middle',
                      }}
                    >
                      {col.render ? col.render(row[col.key], row, rowIdx) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>

    {!loading && data.length > 0 && (
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
        </span>
        <Pagination
          current={page}
          pageSize={limit}
          total={total}
          pageSizeOptions={['10', '20', '50']}
          showSizeChanger
          size="small"
          onChange={onPageChange}
          onShowSizeChange={(_, size) => {
            if (onLimitChange) onLimitChange(size)
            if (onPageChange) onPageChange(1)
          }}
        />
      </div>
    )}
  </div>
)

export default DataTable
