# Snake_Case Migration Summary

## ✅ All Models Converted to snake_case

### 1. **User Model** (`/models/user/index.js`)

**Changed Fields:**
dsads

- `contactNumber` → `contact_number`
- `employeeId` → `employee_id`
- `leavingLatter` → `leaving_letter` (also fixed typo)
- `joiningLetter` → `joining_letter`

**Updated Roles:**

- `super_admin`, `admin`, `director`, `deputy_director`, `record_keeper`

---

### 2. **File Model** (`/models/file/index.js`)

**Changed Fields:**

- `addedBy` → `added_by`
- `updatedBy` → `updated_by`

**Simplified Schema:**

- Removed `department`, `remarks`, `applicantName`
- Kept core fields: `number`, `description`, `applicant`, `purpose`, `shelf`, `status`, `added_by`, `updated_by`

---

### 3. **FileTransaction Model** (`/models/fileHistory/index.js`)

**Changed Fields:**

- `performedBy` → `performed_by`
- `issuedTo` → `issued_to`
- `expectedReturnDate` → `expected_return_date`
- `returnDate` → `return_date`
- `returnCondition` → `return_condition`
- `extensionDays` → `extension_days`
- `newReturnDate` → `new_return_date`
- `extensionReason` → `extension_reason`
- `approvedBy` → `approved_by`

---

### 4. **Room Model** (`/models/room/index.js`)

**Changed Fields:**

- `rackLimit` → `rack_limit`
- `rackOccupied` → `rack_occupied`

---

### 5. **Rack Model** (`/models/rack/index.js`)

**Changed Fields:**

- `shelfLimit` → `shelf_limit`
- `shelfOccupied` → `shelf_occupied`

---

### 6. **Shelf Model** (`/models/shelf/index.js`)

**Changed Fields:**

- `fileLimit` → `file_limit`
- `fileOccupied` → `file_occupied`

---

### 7. **House Model** (`/models/house/index.js`)

✅ Already in correct format (no camelCase fields)

---

## ✅ All Validators Updated

### **User Validator** (`/validators/user/index.js`)

**Updated Fields:**

- `contact_number` (changed validation from 11 to 10 digits to match model)
- `employee_id`
- `leaving_letter` (new, optional)
- `joining_letter` (new, optional)
- `address` (new, required)
- `status` (new, enum: active/inactive)

**Updated Roles:**

- `super_admin`, `admin`, `director`, `deputy_director`, `record_keeper`

**Removed Fields:**

- `resignation_letter`
- `added_files`
- `issued_files`
- `returned_files`

---

### **File Validator** (`/validators/file/index.js`)

**Updated to match new File Model:**

```javascript
createFileSchema:
- number (required)
- description (optional)
- applicant (required)
- purpose (required)
- shelf (required, ObjectId)
- status (optional, default: "issued")
- added_by (required, ObjectId)
- updated_by (optional, ObjectId)

updateFileSchema:
- All fields optional
- Must provide at least 1 field
```

**Removed Fields:**

- `department`
- `remarks`
- `applicant_name`
- `issue_date`
- `issued_to`

---

### **FileTransaction Validator** (`/validators/fileTransaction/index.js`)

**All camelCase fields converted:**

- `performed_by`
- `issued_to`
- `issue_date`
- `expected_return_date`
- `return_date`
- `return_condition`
- `extension_days`
- `new_return_date`
- `extension_reason`
- `approved_by`

---

### **Room Validator** (`/validators/room/index.js`)

**Updated Fields:**

- `house_id`
- `rack_limit`

---

### **Rack Validator** (`/validators/rack/index.js`)

**Updated Fields:**

- `room_id`
- `shelf_limit`
- `shelf_occupied`

---

### **Shelf Validator** (`/validators/shelf/index.js`)

**Updated Fields:**

- `rack_id`
- `file_limit`
- `file_occupied`

---

### **House Validator** (`/validators/house/index.js`)

✅ Already correct (no updates needed)

---

## 🔧 Controllers That Need Updating

### **Priority 1: User Controllers**

**Files to update:**

- `/controllers/user/addUser/index.js`
- `/controllers/user/loginUser/index.js`
- `/controllers/user/getMe/index.js`
- `/controllers/user/logoutUser/index.js`

**Fields to update:**

- `contactNumber` → `contact_number`
- `employeeId` → `employee_id`
- `joiningLetter` → `joining_letter`
- `leavingLatter` → `leaving_letter`

---

### **Priority 2: File Controllers**

**Files to update:**

- `/controllers/file/addFile/index.js`

**Fields to update:**

- `addedBy` → `added_by`
- `updatedBy` → `updated_by`
- Remove: `department`, `remarks`, `applicantName`, `issueDate`, `issuedTo`
- Add: `applicant`, `purpose`

---

### **Priority 3: House Controllers**

**Files:**

- `/controllers/house/add/index.js`
- `/controllers/house/get/index.js`
- `/controllers/house/update/index.js`
- `/controllers/house/delete/index.js`

✅ **No changes needed** (model has no camelCase)

---

### **Priority 4: Room Controllers**

**Files:**

- `/controllers/room/add/index.js`
- `/controllers/room/get/index.js`
- `/controllers/room/update/index.js`
- `/controllers/room/delete/index.js`

**Fields to update:**

- `houseId` → `house` (model uses `house` not `house_id`)
- `rackLimit` → `rack_limit`
- `rackOccupied` → `rack_occupied`

---

### **Priority 5: Rack Controllers**

**Files:**

- `/controllers/rack/add/index.js`
- `/controllers/rack/get/index.js`
- `/controllers/rack/update/index.js`
- `/controllers/rack/delete/index.js`

**Fields to update:**

- `roomId` → `room` (model uses `room` not `room_id`)
- `shelfLimit` → `shelf_limit`
- `shelfOccupied` → `shelf_occupied`

---

### **Priority 6: Shelf Controllers**

**Files:**

- `/controllers/shelf/add/index.js`
- `/controllers/shelf/get/index.js`
- `/controllers/shelf/update/index.js`
- `/controllers/shelf/delete/index.js`

**Fields to update:**

- `rackId` → `rack` (model uses `rack` not `rack_id`)
- `fileLimit` → `file_limit`
- `fileOccupied` → `file_occupied`

---

## ⚠️ Important Notes

### **Validator vs Model Field Name Differences:**

The validators use `*_id` for consistency in API requests, but models use the actual ref name:

| Validator Field | Model Field | Notes                                           |
| --------------- | ----------- | ----------------------------------------------- |
| `house_id`      | `house`     | Validator accepts ID, model stores ObjectId ref |
| `room_id`       | `room`      | Validator accepts ID, model stores ObjectId ref |
| `rack_id`       | `rack`      | Validator accepts ID, model stores ObjectId ref |

**In controllers**, you should:

1. Validate using validator field names (`house_id`, `room_id`, `rack_id`)
2. Transform to model field names before saving (`house`, `room`, `rack`)

Example:

```javascript
// In controller
const { error, value } = createRoomSchema.validate(req.body);
if (error) return res.status(400).json({ message: error.details[0].message });

// Transform for model
const roomData = {
  house: value.house_id, // Transform house_id → house
  number: value.number,
  rack_limit: value.rack_limit,
};

const room = await insertDoc("room", roomData);
```

---

## 📋 Migration Checklist

- [x] Convert User model to snake_case
- [x] Convert File model to snake_case
- [x] Convert FileTransaction model to snake_case
- [x] Convert Room model to snake_case
- [x] Convert Rack model to snake_case
- [x] Convert Shelf model to snake_case
- [x] Update User validator
- [x] Update File validator
- [x] Update FileTransaction validator
- [x] Update Room validator
- [x] Update Rack validator
- [x] Update Shelf validator
- [ ] Update User controllers (4 files)
- [ ] Update File controllers (1+ files)
- [ ] Update House controllers (4 files) - No changes needed
- [ ] Update Room controllers (4 files)
- [ ] Update Rack controllers (4 files)
- [ ] Update Shelf controllers (4 files)
- [ ] Test all API endpoints
- [ ] Update API documentation
- [ ] Update frontend to match new field names

---

## 🚀 Next Steps

1. **Update all controllers** to use new field names
2. **Test database operations** to ensure field names match
3. **Run validation tests** on all endpoints
4. **Update any existing database records** if needed
5. **Update client-side code** to use new field names

---

## 💡 Best Practices Applied

✅ **Consistent snake_case** across all models and validators
✅ **Clear field names** (e.g., `contact_number` instead of `contactNumber`)
✅ **Fixed typo** (`leavingLatter` → `leaving_letter`)
✅ **Proper ref names** in models (e.g., `house`, `room`, `rack` instead of `houseId`)
✅ **Comprehensive validation** with custom error messages
✅ **Type safety** with proper Joi validators
✅ **Database consistency** for easy querying and indexing
