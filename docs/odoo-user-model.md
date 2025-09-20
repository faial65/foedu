# Odoo Custom Module: Education Platform Users

This file contains the custom fields that need to be added to the `res.partner` model in Odoo to store Clerk user data.

## Required Custom Fields in Odoo

You need to create a custom module in Odoo or add these fields through the Odoo interface:

### 1. Clerk User ID Field
- **Field Name**: `clerk_user_id`
- **Field Type**: Char
- **Label**: "Clerk User ID"
- **Required**: True
- **Unique**: True
- **Help**: "Unique identifier from Clerk authentication system"

### 2. Additional User Fields (if needed)
- **Field Name**: `student_id`
- **Field Type**: Char
- **Label**: "Student ID"
- **Help**: "Internal student identifier"

- **Field Name**: `enrollment_date`
- **Field Type**: Date
- **Label**: "Enrollment Date"
- **Help**: "Date when user enrolled in the platform"

- **Field Name**: `user_type`
- **Field Type**: Selection
- **Label**: "User Type"
- **Options**: [('student', 'Student'), ('teacher', 'Teacher'), ('admin', 'Administrator')]
- **Default**: "student"

## Odoo Module Structure (if creating custom module)

```
education_users/
├── __manifest__.py
├── models/
│   ├── __init__.py
│   └── res_partner.py
└── views/
    └── res_partner_views.xml
```

### __manifest__.py
```python
{
    'name': 'Education Platform Users',
    'version': '1.0',
    'category': 'Education',
    'summary': 'Custom user fields for education platform integration',
    'depends': ['base', 'contacts'],
    'data': [
        'views/res_partner_views.xml',
    ],
    'installable': True,
    'application': False,
}
```

### models/res_partner.py
```python
from odoo import models, fields, api

class ResPartner(models.Model):
    _inherit = 'res.partner'
    
    clerk_user_id = fields.Char(
        string='Clerk User ID',
        required=False,
        unique=True,
        help='Unique identifier from Clerk authentication system'
    )
    
    student_id = fields.Char(
        string='Student ID',
        help='Internal student identifier'
    )
    
    enrollment_date = fields.Date(
        string='Enrollment Date',
        help='Date when user enrolled in the platform'
    )
    
    user_type = fields.Selection([
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Administrator')
    ], string='User Type', default='student')
    
    @api.constrains('clerk_user_id')
    def _check_clerk_user_id_unique(self):
        for record in self:
            if record.clerk_user_id:
                existing = self.search([
                    ('clerk_user_id', '=', record.clerk_user_id),
                    ('id', '!=', record.id)
                ])
                if existing:
                    raise ValidationError('Clerk User ID must be unique!')
```

### views/res_partner_views.xml
```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="view_partner_form_education" model="ir.ui.view">
        <field name="name">res.partner.form.education</field>
        <field name="model">res.partner</field>
        <field name="inherit_id" ref="base.view_partner_form"/>
        <field name="arch" type="xml">
            <field name="category_id" position="after">
                <field name="clerk_user_id"/>
                <field name="student_id"/>
                <field name="enrollment_date"/>
                <field name="user_type"/>
            </field>
        </field>
    </record>
</odoo>
```

## Installation Instructions

1. **Option 1: Custom Module**
   - Create the module structure above in your Odoo addons directory
   - Install the module through Odoo Apps interface

2. **Option 2: Studio/Developer Mode**
   - Enable Developer mode in Odoo
   - Go to Settings > Technical > Database Structure > Models
   - Find "res.partner" model
   - Add the custom fields manually

3. **Option 3: Database Direct**
   - Add fields directly through the Odoo interface in Developer mode
   - Go to Settings > Technical > Fields and create the custom fields

## Database Permissions

Ensure your Odoo user has the following permissions:
- Read/Write access to `res.partner` model
- Access to create, update, and delete partner records
- XML-RPC access enabled