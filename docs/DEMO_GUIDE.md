# Quick Demo Guide

## 5-Minute Demo Flow

### Setup (30 seconds)
1. Open `index.html` in browser
2. Login as **admin** (select "Administrator" role)

### Create Template (2 minutes)
1. Click **Templates** tab
2. Click **+ Create Template**
3. Enter:
   - Name: "Standard Welding Job"
   - Description: "Standard welding process"
4. Click **+ Add Stage**
   - Stage name: "Preparation"
5. Click **+ Add Step** (in Preparation stage)
   - Step name: "Material Check"
   - Description: "Verify materials are available"
   - Click **+ Add Requirement**: Enter "Steel plates 10kg"
   - Click **+ Add Requirement**: Enter "Welding rods 2kg"
   - Click **+ Add Checklist Item**: Enter "Materials verified"
   - Click **+ Add Checklist Item**: Enter "No defects found"
6. Click **+ Add Step** (add another step)
   - Step name: "Equipment Setup"
   - Click **+ Add Checklist Item**: Enter "Equipment calibrated"
7. Click **+ Add Stage** (add second stage)
   - Stage name: "Welding"
8. Click **+ Add Step** (in Welding stage)
   - Step name: "MIG Welding"
   - Click **+ Add Checklist Item**: Enter "Welding complete"
   - Click **+ Add Checklist Item**: Enter "Quality checked"
9. Click **Save Template**

### Add Parameters & Variables (Optional - 1 minute)
1. In the template you just created, scroll to **Parameters** section
2. Click **+ Add Parameter**
   - Parameter ID: "plateQuantity"
   - Label: "Number of Plates"
   - Default Value: "10"
3. Click **+ Add Variable**
   - Variable ID: "temperature"
   - Label: "Welding Temperature (°C)"
   - Default Value: "0"
4. Edit a step description to use variable substitution:
   - Change "MIG Welding" description to: "Weld ${plateQuantity} plates at ${temperature}°C"
5. Click **Save Template**

### Create Job (1 minute)
1. Click **Jobs** tab
2. Click **+ Create Job**
3. Select template: "Standard Welding Job"
4. Enter:
   - Job name: "Client ABC Welding"
   - Order number: "ORD-001"
   - Client: "ABC Corporation"
   - Due date: (pick next week)
   - Assign to: "Operator User"
   - **If template has parameters**, fill them in:
     - Number of Plates: "15"
     - (Parameters appear automatically based on template)
5. Click **Create Job**

### Execute Job (1.5 minutes)
1. Logout (top right)
2. Login as **operator**
3. Dashboard shows "My Assigned Jobs"
4. Click **View Job** on "Client ABC Welding"
5. Click **Start** on "Material Check" step
   - Review requirements
   - Click **Start Step**
6. Check the checklist items
7. Add note: "All materials in good condition"
8. Click **Complete Step**
9. Click **Start** on "Equipment Setup" step
10. Check checklist
11. **If step has variables**, update them:
   - Welding Temperature: "245"
   - Click **Update Variables** button
12. Click **Complete Step**
13. Continue through "MIG Welding" step
14. Notice variable substitution: step shows "Weld 15 plates at 245°C"
15. Job shows progress: 3/3 steps completed

### View Results (30 seconds)
1. Click **Dashboard**
2. See statistics updated
3. Job shows as "completed"

## Key Features to Show

### For Manufacturing Clients:
- Template reusability
- Audit trail (who did what, when)
- Checklist enforcement
- Progress tracking
- Requirements visibility
- **Parameters & Variables** (job-specific configuration and runtime state)
- **Variable substitution** (dynamic content with ${name} syntax)

### For Food Production:
- Sequential execution (no skipping)
- Checklist validation
- Traceability (notes on each step)
- Operator accountability
- **Parameters for batch tracking** (lot numbers, quantities)

## Config Demo
1. Login as **admin**
2. Click **Config** tab
3. Select "Manufacturing" preset
4. Show all features enabled
5. Switch to "General" preset
6. Show simpler feature set
7. Custom toggle individual features

## Common Questions

**Q: Can steps run in parallel?**
A: Phase 2 feature (currently sequential only)

**Q: What's the difference between parameters and variables?**
A: Parameters are set once at job creation (immutable config like "plateQuantity: 15"). Variables change during execution (mutable state like "temperature: 245"). Both support ${name} substitution in step text.

**Q: Can we use custom job fields?**
A: Yes! Templates can define parameters (set at creation) and variables (updated during execution). Use ${parameterName} syntax for dynamic content in step descriptions.

**Q: Can we import from Excel?**
A: Phase 2 feature

**Q: Is there mobile support?**
A: Responsive design works on tablets/phones

**Q: Where is data stored?**
A: Currently browser localStorage (demo)
Backend API integration in Phase 2

**Q: Can we track certifications?**
A: Phase 2 feature (user certifications)

**Q: Can we add photos?**
A: Phase 2 feature

**Q: How do I import a template with parameters?**
A: Use the "Import Template" button and select a JSON file (see samples/template-complex.json for example with parameters and variables)

## Testing Scenarios

### Scenario 1: Manufacturing Shop Floor
- Create template with multiple stages
- Assign job to operator
- Operator executes steps in sequence
- Supervisor monitors progress

### Scenario 2: Food Production Line
- Create template with strict sequence
- Operator must complete each checklist
- Cannot skip steps
- Full audit trail

### Scenario 3: Multi-User Workflow
- Admin creates templates
- Supervisor creates jobs
- Multiple operators execute
- Dashboard shows overall status

## Reset Demo Data
Open browser console and run:
```javascript
localStorage.clear();
location.reload();
```

This resets to default demo data with sample template.
