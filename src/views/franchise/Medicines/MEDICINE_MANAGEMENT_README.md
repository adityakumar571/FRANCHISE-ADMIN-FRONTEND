# Medicine Management Module

Simple frontend pages for managing medicines, counters, and racks in the pharmacy inventory system.

## Components

### 1. **CounterMaster.jsx**
Manages pharmacy counters - the main service points where medicines are dispensed.

**Features:**
- Table with columns: Code, Name, Location, Actions
- Add new counter with form modal
- Edit counter inline or via modal
- Delete counter with confirmation
- Search/filter by code, name, or location
- Mock data for demo (3 counters)

**API Integration Points:**
```javascript
// TODO: Replace mock data with API calls
GET  /franchise/counters              // List all counters
POST /franchise/counters              // Add new counter
PUT  /franchise/counters/:id          // Update counter
DELETE /franchise/counters/:id        // Delete counter
```

**Usage:**
```
Navigate to: /franchise/medicines/counters
Access Key: medicines_counter
```

---

### 2. **RackMaster.jsx**
Manages racks within counters - storage units for organizing medicines.

**Features:**
- Counter dropdown filter (auto-populates rack list)
- Table with columns: Code, Name, Shelves, Capacity, Counter, Actions
- Add/Edit/Delete racks per counter
- Search by code or name
- Counter pre-selection when adding new rack
- Mock data for demo (4 racks across 3 counters)

**API Integration Points:**
```javascript
// TODO: Replace mock data with API calls
GET  /franchise/racks?counterId=:id   // List racks for counter
GET  /franchise/racks                 // List all racks
POST /franchise/racks                 // Add new rack
PUT  /franchise/racks/:id             // Update rack
DELETE /franchise/racks/:id           // Delete rack
```

**Key Logic:**
- Filter racks by selected counter
- Auto-reset rack selection when counter changes
- Validation ensures counter is selected before adding

**Usage:**
```
Navigate to: /franchise/medicines/racks-master
Access Key: medicines_rack
```

---

### 3. **MedicineManagement.jsx**
Assign existing medicines to counters and racks - the main inventory management interface.

**Features:**

**Step-by-Step Form:**
1. **Select Counter** - Choose from available counters
2. **Select Rack** - Auto-populated based on selected counter
3. **Search & Select Medicine** - Searchable list of existing medicines
   - Search by: Code, Name, or Batch Number
   - Shows: Medicine Code, Name, Batch, Available Quantity
   - Clickable selection with checkmark indicator
4. **Add Button** - Assigns medicine to selected rack

**Current Assignments Display:**
- Grouped table showing all medicine assignments
- Grouped by Counter > Rack
- Shows: Medicine Code, Name, Batch, Quantity Assigned, Date Added
- Remove/Delete option for each assignment

**Mock Data:**
- 6 existing medicines (various pharmaceutical products)
- 3 existing assignments across counters and racks

**API Integration Points:**
```javascript
// TODO: Replace mock data with API calls
GET  /franchise/medicines                    // Get existing medicines list
GET  /franchise/counters                     // Get counters
GET  /franchise/racks?counterId=:id         // Get racks for counter
POST /franchise/inventory/assignments        // Assign medicine to rack
GET  /franchise/inventory/assignments        // Get all assignments
DELETE /franchise/inventory/assignments/:id // Remove assignment
```

**Key Features:**
- Cascading dropdowns (Counter → Rack)
- Searchable medicine selection with preview
- Real-time rack filtering
- Validation at each step
- Toast notifications for user feedback
- Delete confirmation modal

**Usage:**
```
Navigate to: /franchise/medicines/management
Access Key: medicines_management
```

---

## UI Pattern

All three components follow the same clean, minimal design:

**Styling:**
- Inter font family
- Blue accent color: `#0c3b73`
- Neutral colors: grays and whites
- Responsive design with flexbox/grid
- Mobile-friendly tables with scroll

**Reusable Components:**
```javascript
// Table header cell
const Th = ({ c }) => <th>...</th>

// Table data cell
const Td = ({ children, style = {} }) => <td>...</td>
```

**Modal Patterns:**
- Centered overlay with 90% width, max 400px
- Smooth fade background
- Close button (X) in top-right
- Cancel & Action buttons at bottom

**Form Elements:**
- Input fields with labels
- Dropdowns for selections
- Search with icon
- Toast notifications (via react-hot-toast)

---

## State Management

Each component uses React hooks:

```javascript
// CounterMaster
const [counters, setCounters] = useState([...])
const [search, setSearch] = useState('')
const [showModal, setShowModal] = useState(false)
const [editingId, setEditingId] = useState(null)
const [formData, setFormData] = useState({})
const [deleteId, setDeleteId] = useState(null)

// RackMaster
const [racks, setRacks] = useState([...])
const [selectedCounter, setSelectedCounter] = useState('')
const [filtered, setFiltered] = useState([])  // via useMemo

// MedicineManagement
const [assignments, setAssignments] = useState([...])
const [selectedCounter, setSelectedCounter] = useState('')
const [selectedRack, setSelectedRack] = useState('')
const [selectedMedicine, setSelectedMedicine] = useState('')
const [medicineSearch, setMedicineSearch] = useState('')
```

---

## Future API Integration Checklist

- [ ] Replace mock counter data with API calls
- [ ] Replace mock rack data with API calls
- [ ] Replace mock medicine data with API calls
- [ ] Implement counter CRUD operations
- [ ] Implement rack CRUD operations
- [ ] Implement medicine assignment creation
- [ ] Implement assignment deletion
- [ ] Add error handling for failed API calls
- [ ] Add loading states during API calls
- [ ] Add pagination for large datasets
- [ ] Add bulk operations (if needed)
- [ ] Implement optimistic updates

---

## Navigation Integration

Routes added to `/franchise/medicines` menu:
- **Counter Master** → `/franchise/medicines/counters`
- **Rack Master** → `/franchise/medicines/racks-master`
- **Medicine Management** → `/franchise/medicines/management`

Access Keys:
- `medicines_counter` - Counter Master
- `medicines_rack` - Rack Master (updated to also cover RackMaster page)
- `medicines_management` - Medicine Management

---

## Folder Structure

```
src/views/franchise/Medicines/
├── CounterMaster.jsx              ✅ Counter management
├── RackMaster.jsx                 ✅ Rack management
├── MedicineManagement.jsx          ✅ Assign medicines to racks
├── MEDICINE_MANAGEMENT_README.md   ✅ This file
├── MedicineList.jsx               (existing)
├── AddMedicine.jsx                (existing)
├── EditMedicine.jsx               (existing)
├── MedicineDetails.jsx            (existing)
├── BatchDetails.jsx               (existing)
├── RackManagement.jsx             (existing)
├── BarcodeLabel.jsx               (existing)
├── MedicineImages.jsx             (existing)
├── GenericMapping.jsx             (existing)
├── AlternativeMedicines.jsx        (existing)
├── MedicineMasters.jsx            (existing)
├── ExpiryDashboard.jsx            (existing)
├── BarcodePrintLabel.jsx          (existing)
└── BulkBarcodePrint.jsx           (existing)
```

---

## Testing Notes

**Mock Data Flow:**
1. All components initialize with mock data
2. Add/Edit/Delete operations update local state
3. No API calls are made - state persists only during session
4. Page refresh resets data to initial mock state

**To Test:**
1. Navigate to Counter Master - Add, Edit, Delete a counter
2. Navigate to Rack Master - Select a counter, then manage its racks
3. Navigate to Medicine Management - Select counter, rack, then assign a medicine
4. Verify confirmation modals work correctly
5. Check search/filter functionality

---

## Accessibility

- Semantic HTML (input, select, button, table)
- Keyboard navigation support
- Clear labels on form fields
- Color contrast ratios meet WCAG AA
- Focus states on interactive elements
- Alt text on icons (where applicable)

---

## Performance

- `useMemo` used for filtered lists to prevent unnecessary re-renders
- Modal components use conditional rendering
- No animations to keep rendering light
- Static mock data (no heavy computations)

---

## Notes for Future Development

1. **Authentication**: Ensure API calls include auth tokens
2. **Error Handling**: Add try-catch blocks and user-friendly error messages
3. **Loading States**: Show spinners during API calls
4. **Pagination**: Large datasets should be paginated
5. **Real-time Updates**: Consider WebSocket for multi-user scenarios
6. **Validation**: Add server-side validation in addition to client-side
7. **Caching**: Implement caching for frequently accessed data
8. **Bulk Operations**: Consider adding bulk import/export features

---

Last Updated: 2025-01-20
