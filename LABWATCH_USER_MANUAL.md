# LabWatch App - User Manual

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
4. [Dashboard Overview](#dashboard-overview)
5. [Room Management](#room-management)
6. [Sensor Monitoring](#sensor-monitoring)
7. [Alert System](#alert-system)
8. [Incident Management](#incident-management)
9. [Camera & AI Detection](#camera--ai-detection)
10. [AI Assistant](#ai-assistant)
11. [Settings & Administration](#settings--administration)
12. [Troubleshooting](#troubleshooting)
13. [Emergency Procedures](#emergency-procedures)
14. [Appendix](#appendix)

---

## 1. Introduction

### What is LabWatch?

LabWatch is a comprehensive laboratory monitoring and safety management application designed to help you monitor environmental conditions, track safety incidents, and ensure optimal laboratory operations. The app provides real-time monitoring of various sensors, automated alert systems, and AI-powered assistance for safety analysis.

**[Image Placeholder: LabWatch App Logo and Main Interface]**

### Key Features

- **Real-time Monitoring**: Track temperature, humidity, air quality, thermal imaging, and vibration sensors
- **Smart Alerts**: Automated notifications based on configurable thresholds
- **Incident Management**: Record, track, and manage safety incidents
- **AI-Powered People Detection**: Monitor occupancy and safety compliance
- **Intelligent Assistant**: Get AI-powered insights and recommendations
- **Multi-room Support**: Monitor multiple laboratory spaces simultaneously
- **Role-based Access**: Different permission levels for various user types

### System Requirements

- iOS 13.0+ or Android 8.0+
- Internet connection for real-time updates
- Camera permissions for AI detection features
- Notification permissions for alerts

---

## 2. Getting Started

### Installation

1. Download LabWatch from your device's app store
2. Install the application
3. Launch the app

**[Image Placeholder: App Store Download Screenshots]**

### First Time Setup

1. **Account Creation**: Register with your email and create a secure password
2. **Profile Setup**: Complete your profile information
3. **Permission Requests**: Grant necessary permissions for camera, notifications, and location
4. **Initial Configuration**: Set up your first room and connect sensors

**[Image Placeholder: Setup Flow Screenshots]**

---

## 3. Authentication

### Login Process

1. Open the LabWatch app
2. Enter your registered email address
3. Enter your password
4. Tap "Sign In"

**[Image Placeholder: Login Screen]**

### Account Types

- **Standard User**: Monitor rooms, view alerts, create incidents
- **Administrator**: Full system access, user management, system configuration
- **Pending User**: Awaiting approval from administrator

### Password Reset

1. On the login screen, tap "Forgot Password?"
2. Enter your email address
3. Check your email for reset instructions
4. Follow the link to create a new password

**[Image Placeholder: Password Reset Flow]**

### Account Approval

New accounts require administrator approval:
1. After registration, you'll see a "Pending Approval" screen
2. Wait for an administrator to approve your account
3. You'll receive an email notification once approved

**[Image Placeholder: Pending Approval Screen]**

---

## 4. Dashboard Overview

The Dashboard is your central hub for monitoring all laboratory activities.

**[Image Placeholder: Main Dashboard Screenshot]**

### Dashboard Components

#### Room Selector
- Switch between different monitored rooms
- View current status at a glance
- Quick access to detailed room information

**[Image Placeholder: Room Selector Dropdown]**

#### Recent Alerts Section
- View the 5 most recent alerts
- Color-coded by severity (Critical, High, Medium, Low)
- Tap to view full alert details
- Quick acknowledge option

**[Image Placeholder: Recent Alerts Section]**

#### Quick Actions Carousel
- **Add Room**: Set up a new monitoring space
- **Add Camera**: Connect a new surveillance camera
- **Add Incident**: Report a safety incident
- **System Health**: Check overall system status

**[Image Placeholder: Quick Actions Carousel]**

#### Other Monitored Rooms
- Overview of all other active rooms
- Status indicators for each room
- Quick navigation to specific rooms

**[Image Placeholder: Other Monitored Rooms Section]**

### Navigation

The app uses a tab-based navigation system:

- **Dashboard**: Main overview and quick actions
- **Rooms**: Detailed room management and monitoring
- **Alerts**: Alert history and management
- **Incidents**: Incident tracking and reporting
- **More**: Settings, administration, and additional features

**[Image Placeholder: Bottom Tab Navigation]**

---

## 5. Room Management

### Creating a New Room

1. Navigate to **Dashboard** > **Quick Actions** > **Add Room**
   OR
   Go to **Rooms** tab > **+** button

2. Fill out room information:
   - **Room Name**: Descriptive name for the space
   - **Location**: Physical location or building reference
   - **ESP32 Module ID**: Hardware identifier for sensor connection
   - **Monitoring Status**: Enable/disable automated monitoring

3. Tap **Save** to create the room

**[Image Placeholder: Add Room Form]**

### Room Detail View

Access detailed information about any room:

1. Navigate to **Rooms** tab
2. Select a room from the list
3. View comprehensive sensor data and controls

**[Image Placeholder: Room Detail Screen]**

#### Sensor Data Display

Each room shows real-time data from connected sensors:

- **Temperature & Humidity**: Current readings with dial gauges
- **Air Quality**: PM2.5 and PM10 particle measurements
- **Thermal Imaging**: Heat map visualization from thermal cameras
- **Vibration**: Acceleration and movement detection

**[Image Placeholder: Sensor Data Displays]**

#### Room Actions

- **Edit Room**: Modify room settings and information
- **Archive Room**: Temporarily disable monitoring
- **Test Camera Connection**: Verify camera connectivity
- **Add Camera**: Connect additional surveillance equipment

### Camera Management

#### Adding a Camera

1. From room detail view, tap **Add Camera**
2. Enter camera information:
   - **Camera Name**: Descriptive identifier
   - **IP Address**: Network address of the camera
   - **Username/Password**: Authentication credentials
   - **Location**: Physical placement description

3. Test connection and save

**[Image Placeholder: Add Camera Form]**

#### Camera Features

- **Live View**: Real-time video streaming
- **People Detection**: AI-powered occupancy monitoring
- **Connection Status**: Real-time connectivity monitoring
- **Control Panel**: Camera settings and adjustments

**[Image Placeholder: Camera Live View and Controls]**

### Room Status Indicators

Rooms display status indicators based on current conditions:

- **🟢 Normal**: All systems operating within acceptable ranges
- **🟡 Warning**: One or more sensors showing elevated readings
- **🔴 Critical**: Immediate attention required

---

## 6. Sensor Monitoring

### Supported Sensor Types

#### Temperature & Humidity (SHT20)
- **Temperature Range**: -40°C to +125°C
- **Humidity Range**: 0% to 100% RH
- **Alert Thresholds**:
  - Critical High Temperature: >35°C
  - Critical Low Temperature: <10°C
  - High Temperature: >30°C
  - Low Temperature: <15°C
  - High Humidity: >70%
  - Low Humidity: <30%

**[Image Placeholder: Temperature/Humidity Sensor Display]**

#### Air Quality (SDS011)
- **PM2.5 Monitoring**: Fine particulate matter
- **PM10 Monitoring**: Coarse particulate matter
- **AQI Calculation**: Air Quality Index based on EPA standards
- **Alert Thresholds**:
  - PM2.5 Unhealthy: >55.5 µg/m³
  - PM2.5 Moderate: >12.1 µg/m³
  - PM10 Unhealthy: >154 µg/m³
  - PM10 Moderate: >54 µg/m³

**[Image Placeholder: Air Quality Sensor Display]**

#### Thermal Imaging (AMG8833)
- **8x8 Pixel Array**: Heat distribution visualization
- **Temperature Range**: 0°C to 80°C
- **Alert Conditions**:
  - Critical thermal anomaly: Max >50°C or Avg >35°C
  - High thermal anomaly: Max >45°C or Avg >30°C

**[Image Placeholder: Thermal Imaging Display]**

#### Vibration (MPU6050)
- **3-axis Accelerometer**: X, Y, Z movement detection
- **RMS Calculation**: Root mean square acceleration
- **Alert Thresholds**:
  - Critical vibration: >5.0g
  - High vibration: >3.0g
  - Medium vibration: >1.5g

**[Image Placeholder: Vibration Sensor Display]**

### Reading Sensor Data

#### Dial Gauges
- **Current Value**: Large numeric display
- **Status Color**: Visual indicator of current condition
- **Range Indicators**: Min/max acceptable values
- **Unit Display**: Measurement units (°C, %, µg/m³, g)

#### Status Interpretation
- **Green**: Normal operating conditions
- **Yellow**: Approaching threshold limits
- **Red**: Exceeding safe operating parameters

### Historical Data

Access historical sensor readings:
1. Navigate to room detail view
2. Scroll to sensor section
3. Tap on individual sensor for detailed history
4. View trends and patterns over time

**[Image Placeholder: Historical Data Charts]**

---

## 7. Alert System

### Understanding Alerts

Alerts are automatically generated when sensor readings exceed predefined thresholds or when system anomalies are detected.

**[Image Placeholder: Alerts List Screen]**

### Alert Severity Levels

#### Critical (Red)
- Immediate safety risk
- Requires urgent attention
- May trigger emergency protocols
- Examples: Temperature >35°C, PM2.5 >55.5 µg/m³

#### High (Orange)
- Significant concern
- Should be addressed promptly
- May lead to critical conditions if ignored
- Examples: Temperature >30°C, High vibration

#### Medium (Yellow)
- Elevated readings
- Monitor closely
- Plan corrective action
- Examples: Moderate air quality, approaching thresholds

#### Low (Blue)
- Minor deviations
- Informational purposes
- No immediate action required

### Alert Types

- **Temperature Alerts**: High/low temperature conditions
- **Humidity Alerts**: Excessive or insufficient humidity
- **Air Quality Alerts**: Poor air quality conditions
- **Thermal Anomaly**: Unusual heat patterns
- **Vibration Alerts**: Excessive movement or shaking
- **System Alerts**: Connectivity or hardware issues

### Managing Alerts

#### Viewing Alert Details

1. Navigate to **Alerts** tab
2. Tap on any alert to view full details
3. Review:
   - Alert message and description
   - Triggering sensor value
   - Room and sensor location
   - Timestamp of occurrence
   - Current acknowledgment status

**[Image Placeholder: Alert Detail Screen]**

#### Acknowledging Alerts

1. Open alert details
2. Tap **Acknowledge** button
3. Alert status changes to "Acknowledged"
4. Your name and timestamp are recorded

**[Image Placeholder: Alert Acknowledgment]**

#### Filtering Alerts

Use filters to find specific alerts:
- **By Severity**: Critical, High, Medium, Low
- **By Status**: Acknowledged, Unacknowledged
- **By Room**: Specific location
- **By Date Range**: Time period selection

**[Image Placeholder: Alert Filters]**

#### Search Functionality

Search alerts by:
- Room name
- Severity level
- Sensor ID
- Acknowledging user name
- Alert message content

### Alert Actions

#### Create Incident from Alert

Convert critical alerts into formal incidents:
1. From alert details, tap **Create Incident**
2. Alert information pre-populates incident form
3. Add additional details and severity assessment
4. Submit incident for tracking

**[Image Placeholder: Create Incident from Alert]**

#### Emergency Procedures

For critical alerts:
1. Tap **Call Emergency** for immediate assistance
2. Follow displayed emergency procedures
3. Document actions taken in incident report

---

## 8. Incident Management

### What are Incidents?

Incidents are formal records of safety events, equipment failures, or other significant occurrences that require documentation and follow-up.

**[Image Placeholder: Incidents List Screen]**

### Creating an Incident

#### Manual Incident Creation

1. Navigate to **Incidents** tab > **+** button
   OR
   **Dashboard** > **Quick Actions** > **Add Incident**

2. Fill out incident details:
   - **Title**: Brief description of the incident
   - **Description**: Detailed explanation of what occurred
   - **Severity**: Critical, High, Medium, Low
   - **Room**: Location where incident occurred
   - **Incident Type**: Category of incident
   - **Status**: Open, In Progress, Resolved, Closed

3. Tap **Save** to create the incident

**[Image Placeholder: Add Incident Form]**

#### From Alert Conversion

Critical alerts can be automatically converted to incidents:
1. Open a critical alert
2. Tap **Create Incident**
3. Pre-filled form with alert data
4. Add additional context and save

### Incident Types

- **Safety Incident**: Personal injury or safety violation
- **Equipment Failure**: Hardware malfunction or breakdown
- **Environmental**: Air quality, temperature, or other environmental issues
- **Security**: Unauthorized access or security breach
- **Maintenance**: Routine or emergency maintenance needs
- **Other**: Miscellaneous incidents requiring documentation

### Incident Severity

- **Critical**: Immediate safety risk, major equipment failure
- **High**: Significant impact on operations or safety
- **Medium**: Moderate impact, requires attention
- **Low**: Minor issue, minimal impact

### Incident Status Workflow

1. **Open**: Newly created, awaiting assignment
2. **In Progress**: Actively being investigated or resolved
3. **Resolved**: Solution implemented, awaiting verification
4. **Closed**: Incident fully resolved and documented

### Incident Details

Each incident record includes:
- **Incident ID**: Unique identifier
- **Creation timestamp**: When incident was reported
- **Last updated**: Most recent modification
- **Assigned personnel**: Responsible party (if applicable)
- **Room association**: Location of incident
- **Related alerts**: Connected alert notifications
- **Resolution notes**: Actions taken and outcomes

**[Image Placeholder: Incident Detail Screen]**

### Editing Incidents

1. Open incident details
2. Tap **Edit** button
3. Modify information as needed
4. Update status to reflect current situation
5. Save changes

### Incident Reports

Generate reports for:
- Compliance documentation
- Trend analysis
- Management review
- Regulatory requirements

**[Image Placeholder: Incident Reports]**

---

## 9. Camera & AI Detection

### Camera System Overview

LabWatch integrates with IP cameras to provide visual monitoring and AI-powered people detection for enhanced safety and security.

**[Image Placeholder: Camera System Overview]**

### Setting Up Cameras

#### Camera Requirements

- **IP Camera**: Network-connected camera with HTTP/RTSP streaming
- **Network Access**: Camera must be accessible on the same network
- **Authentication**: Valid username and password credentials
- **Supported Formats**: MJPEG, H.264 streaming

#### Adding a Camera

1. From room detail view, tap **Add Camera**
2. Enter camera configuration:
   - **Camera Name**: Descriptive identifier
   - **IP Address**: Camera's network IP address
   - **Port**: Network port (usually 80 or 8080)
   - **Username**: Camera login username
   - **Password**: Camera login password
   - **Stream Path**: URL path to video stream
   - **Location**: Physical placement description

3. Test connection to verify settings
4. Save camera configuration

**[Image Placeholder: Camera Setup Form]**

### Live Video Monitoring

#### Camera Live View

Access real-time video streams:
1. Navigate to room with configured cameras
2. Scroll to **Camera Section**
3. Tap on camera card to open live view
4. Use controls to adjust viewing options

**[Image Placeholder: Camera Live View]**

#### Camera Controls

- **Play/Pause**: Start/stop video stream
- **Refresh**: Reconnect to camera
- **Fullscreen**: Expand view for detailed monitoring
- **Snapshot**: Capture still image
- **Settings**: Adjust camera parameters

### AI People Detection

#### Overview

LabWatch uses advanced AI models to detect and count people in camera feeds, helping monitor occupancy and ensure safety compliance.

**[Image Placeholder: People Detection in Action]**

#### Detection Features

- **Real-time People Counting**: Live count of individuals in view
- **Occupancy Tracking**: Historical occupancy data
- **Safety Compliance**: Alerts for occupancy limits
- **Detection Accuracy**: Confidence scores for detections
- **Multiple Person Tracking**: Simultaneous detection of multiple individuals

#### Detection Models

##### TensorFlow.js Implementation
- **COCO-SSD Model**: Pre-trained object detection
- **Client-side Processing**: On-device AI processing
- **Real-time Performance**: Fast detection and counting
- **Privacy-focused**: No data sent to external servers

##### Real AI Integration
- **Enhanced Accuracy**: Improved detection algorithms
- **Advanced Analytics**: Behavioral pattern analysis
- **Custom Training**: Adaptable to specific environments
- **Cloud Processing**: Server-side AI computation

#### People Counter Display

The people counter shows:
- **Current Count**: Number of people detected
- **Detection Confidence**: Accuracy percentage
- **Last Update**: Timestamp of latest detection
- **Status Indicator**: Active/inactive detection state

**[Image Placeholder: People Counter Display]**

#### Setting Up People Detection

1. Ensure camera is properly configured and streaming
2. Navigate to camera section in room details
3. Enable **People Detection** toggle
4. Choose detection model (TensorFlow.js or Real AI)
5. Adjust sensitivity settings if needed
6. Monitor detection accuracy and adjust as necessary

### Camera Management

#### Camera Status Monitoring

Each camera displays:
- **Connection Status**: Online/offline indicator
- **Stream Quality**: Video resolution and frame rate
- **Last Seen**: Timestamp of last successful connection
- **Detection Status**: AI processing state

#### Testing Camera Connection

1. From room detail view, find camera section
2. Tap **Test Connection** on camera card
3. System attempts to connect and retrieve video stream
4. Results displayed with success/failure status
5. Troubleshooting suggestions provided if connection fails

**[Image Placeholder: Camera Connection Test]**

#### Camera Troubleshooting

Common issues and solutions:

**Connection Failed**
- Verify IP address and port settings
- Check network connectivity
- Confirm username/password credentials
- Ensure camera is powered on and accessible

**Poor Video Quality**
- Check network bandwidth
- Verify camera resolution settings
- Adjust streaming parameters
- Consider camera positioning and lighting

**People Detection Not Working**
- Ensure adequate lighting in camera view
- Verify camera angle and field of view
- Check that people are clearly visible
- Restart detection service if needed

### Privacy and Security

#### Data Protection
- Video streams are processed locally when possible
- No video data stored permanently unless explicitly saved
- User authentication required for all camera access
- Encrypted transmission of video data

#### Access Control
- Role-based camera access permissions
- Audit logging of camera viewing activities
- Secure credential storage for camera authentication
- Administrative controls for camera management

---

## 10. AI Assistant

### Overview

LabWatch includes an intelligent AI assistant powered by Google's Gemini AI to provide contextual insights, safety recommendations, and system analysis.

**[Image Placeholder: AI Assistant Interface]**

### Accessing the Assistant

1. Tap the **Assistant** tab in the bottom navigation
   OR
2. Tap the floating assistant button (if available on other screens)
3. The chat interface opens with current system status

### Assistant Capabilities

#### System Status Analysis
- **Real-time Overview**: Current status of all monitored systems
- **Critical Alerts Summary**: Immediate attention items
- **Sensor Status Review**: Comprehensive sensor health check
- **Incident Overview**: Open incidents and their status

**[Image Placeholder: System Status Summary]**

#### Safety Recommendations
- **Proactive Suggestions**: Recommendations based on current conditions
- **Best Practices**: Industry-standard safety guidelines
- **Maintenance Reminders**: Equipment care and calibration schedules
- **Compliance Guidance**: Regulatory requirement assistance

#### Room-Specific Analysis

Request detailed analysis for specific rooms:
1. Type: "Analyze Room [Room Name]"
2. Assistant provides:
   - Current environmental conditions
   - Safety assessment
   - Specific recommendations
   - Alert history and trends

**[Image Placeholder: Room Analysis Response]**

### Chat Interface

#### Asking Questions

The assistant can help with:
- **System Status**: "What's the current system status?"
- **Room Conditions**: "How is Lab Room 1 doing?"
- **Alert Information**: "What are the current critical alerts?"
- **Safety Guidance**: "What should I do about high humidity?"
- **Incident Help**: "How do I create an incident?"
- **General Questions**: "What are the temperature thresholds?"

#### Sample Questions

- "What rooms need attention right now?"
- "Show me the most critical alerts"
- "What's the air quality like across all rooms?"
- "Are there any open incidents?"
- "What maintenance is due?"
- "How many people are currently in Lab Room 2?"

**[Image Placeholder: Sample Chat Conversation]**

### Assistant Features

#### Context Awareness
- Knows your current location and permissions
- Understands system state and recent changes
- Provides relevant, timely information
- Maintains conversation context

#### Real-time Data Integration
- Accesses live sensor data
- Reviews current alert status
- Checks incident records
- Monitors system health

#### Multi-modal Responses
- Text-based explanations
- Structured data summaries
- Action recommendations
- Priority-based information organization

### System Status Header

The assistant screen includes a real-time system status header showing:

- **Active Alerts Count**: Number of unacknowledged alerts
- **Critical Sensors**: Sensors requiring immediate attention
- **Open Incidents**: Current incident count
- **Overall System Health**: General status indicator

**[Image Placeholder: System Status Header]**

### Assistant Settings

Configure assistant behavior:
- **Response Detail Level**: Brief, normal, or detailed responses
- **Notification Preferences**: When to receive assistant insights
- **Privacy Settings**: Data usage and sharing preferences
- **Language Settings**: Communication language preferences

---

## 11. Settings & Administration

### User Settings

#### Profile Management

Access your profile settings:
1. Navigate to **More** tab
2. Tap **Profile** section
3. View and edit personal information

**[Image Placeholder: User Profile Screen]**

Profile information includes:
- **Name**: Display name for alerts and incidents
- **Email**: Account identifier and notification address
- **Role**: User permissions level
- **Department**: Organizational unit
- **Phone Number**: Emergency contact information

#### Notification Settings

Configure alert and notification preferences:
1. Go to **More** > **Settings** > **Notifications**
2. Adjust settings:
   - **Push Notifications**: Enable/disable mobile notifications
   - **Email Alerts**: Receive alerts via email
   - **Alert Severity Filter**: Choose which severity levels to receive
   - **Quiet Hours**: Set times when notifications are reduced
   - **Incident Notifications**: Updates on incident status changes

**[Image Placeholder: Notification Settings]**

#### Appearance Settings

Customize the app appearance:
1. Navigate to **More** > **Settings** > **Appearance**
2. Options include:
   - **Theme**: Light, Dark, or System automatic
   - **Color Scheme**: Primary color preferences
   - **Font Size**: Text size adjustment
   - **Chart Colors**: Customize data visualization colors

**[Image Placeholder: Appearance Settings]**

### Administrative Functions

#### User Management (Admin Only)

Administrators can manage user accounts:
1. Go to **More** > **Admin** > **Manage Users**
2. View all system users
3. Available actions:
   - **Approve Pending Users**: Grant access to new registrations
   - **Edit User Roles**: Change permission levels
   - **Deactivate Users**: Suspend user access
   - **Reset Passwords**: Help users with login issues

**[Image Placeholder: User Management Interface]**

#### System Configuration (Admin Only)

Configure system-wide settings:
1. Navigate to **More** > **Admin** > **Configuration**
2. Adjust settings:
   - **Alert Thresholds**: Modify trigger values for different sensor types
   - **Monitoring Intervals**: Set frequency of sensor data collection
   - **Retention Policies**: Configure how long data is stored
   - **Emergency Contacts**: Set up emergency notification recipients
   - **API Keys**: Manage external service integrations

**[Image Placeholder: System Configuration]**

#### Audit Logs (Admin Only)

Review system activity:
1. Go to **More** > **Admin** > **Audit Logs**
2. View detailed logs of:
   - User login/logout activities
   - Alert acknowledgments
   - Incident creation and updates
   - System configuration changes
   - Data export activities

**[Image Placeholder: Audit Logs Screen]**

### Data Management

#### Data Export

Export system data for analysis or backup:
1. Navigate to **More** > **Data Export**
2. Choose export options:
   - **Date Range**: Select time period
   - **Data Types**: Sensors, alerts, incidents, users
   - **Format**: CSV, JSON, PDF report
   - **Rooms**: All rooms or specific selections

3. Generate and download export file

**[Image Placeholder: Data Export Interface]**

#### Data Retention

Understanding data storage:
- **Real-time Data**: Current sensor readings (always available)
- **Historical Sensor Data**: Configurable retention period
- **Alert Records**: Permanent storage with archival options
- **Incident Records**: Permanent storage for compliance
- **Audit Logs**: Configurable retention based on organizational needs

### System Health

#### System Health Dashboard

Monitor overall system performance:
1. Go to **More** > **System Health**
2. View system metrics:
   - **Server Status**: Application server health
   - **Database Performance**: Data storage and retrieval speed
   - **Sensor Connectivity**: Connected vs. disconnected sensors
   - **Alert Processing**: Alert generation and notification speed
   - **User Activity**: Active user sessions and usage patterns

**[Image Placeholder: System Health Dashboard]**

#### Performance Monitoring

Key performance indicators:
- **Response Time**: How quickly the app loads and responds
- **Data Accuracy**: Sensor reading reliability
- **Uptime**: System availability percentage
- **Error Rates**: Frequency of system errors or failures

### Integration Settings

#### External Services

Configure connections to external systems:
- **Email Server**: SMTP settings for notification delivery
- **Emergency Services**: Integration with emergency response systems
- **Backup Services**: Automated data backup configurations
- **Third-party APIs**: Weather data, compliance systems, etc.

#### API Management

For developers and integrators:
- **API Keys**: Generate and manage access tokens
- **Rate Limiting**: Control API usage
- **Documentation**: Access to API documentation
- **Webhooks**: Configure external system notifications

---

## 12. Troubleshooting

### Common Issues and Solutions

#### Login Problems

**Cannot Sign In**
1. Verify email address and password are correct
2. Check internet connection
3. Try password reset if necessary
4. Contact administrator if account is pending approval

**App Won't Load**
1. Force close and restart the app
2. Check device internet connection
3. Restart your device
4. Reinstall the app if problems persist

**[Image Placeholder: Login Troubleshooting Steps]**

#### Sensor Data Issues

**No Data Showing**
1. Verify room has ESP32 module ID configured
2. Check that sensors are properly connected to hardware
3. Ensure ESP32 device has internet connectivity
4. Verify device is sending data to Firebase Realtime Database

**Incorrect Readings**
1. Check sensor calibration
2. Verify sensor placement and environment
3. Look for physical obstructions or interference
4. Review sensor specifications and operating ranges

**Data Delays**
1. Check internet connection speed
2. Verify Firebase Realtime Database connectivity
3. Review network firewall settings
4. Contact system administrator if delays persist

**[Image Placeholder: Sensor Troubleshooting Guide]**

#### Alert Issues

**Alerts Not Appearing**
1. Check notification permissions in device settings
2. Verify alert thresholds are properly configured
3. Ensure room monitoring is enabled
4. Check if alerts are being filtered by current settings

**False Alerts**
1. Review and adjust alert thresholds
2. Check sensor calibration
3. Consider environmental factors affecting readings
4. Temporary disable monitoring if maintenance is occurring

**Cannot Acknowledge Alerts**
1. Verify you have proper permissions
2. Check internet connection
3. Try refreshing the alert list
4. Contact administrator if permissions issues persist

#### Camera and AI Detection Issues

**Camera Won't Connect**
1. Verify IP address and port settings
2. Check username and password credentials
3. Ensure camera is powered on and network accessible
4. Test camera access from a web browser first

**People Detection Not Working**
1. Ensure adequate lighting in camera view
2. Check camera angle and field of view
3. Verify people are clearly visible and not obscured
4. Restart people detection service

**Poor Detection Accuracy**
1. Improve lighting conditions
2. Adjust camera position for better view
3. Clean camera lens
4. Consider switching detection models

**[Image Placeholder: Camera Troubleshooting Steps]**

#### AI Assistant Issues

**Assistant Not Responding**
1. Check internet connection
2. Verify Google AI services are accessible
3. Try rephrasing your question
4. Restart the assistant chat

**Incorrect Information**
1. Assistant responses are based on current system data
2. Refresh data if information seems outdated
3. Be specific in your questions for better accuracy
4. Report persistent accuracy issues to administrators

### Error Messages

#### Common Error Messages and Solutions

**"Network Error"**
- Check internet connection
- Verify WiFi or cellular data is enabled
- Try switching between WiFi and cellular data

**"Permission Denied"**
- Contact administrator to verify your account permissions
- Ensure your account is approved and active
- Check if specific feature requires higher permission level

**"Sensor Data Unavailable"**
- ESP32 device may be offline
- Check sensor hardware connections
- Verify room configuration includes proper module ID

**"Camera Connection Failed"**
- Verify camera IP address and credentials
- Check network connectivity to camera
- Ensure camera is powered on and functioning

**[Image Placeholder: Error Message Examples]**

### Performance Issues

#### App Running Slowly

1. **Close Other Apps**: Free up device memory
2. **Restart App**: Force close and reopen LabWatch
3. **Update App**: Ensure you have the latest version
4. **Restart Device**: Full device restart can resolve memory issues
5. **Check Storage**: Ensure device has adequate free space

#### Data Not Updating

1. **Pull to Refresh**: Use pull-to-refresh gesture on data screens
2. **Check Connection**: Verify stable internet connection
3. **Background Refresh**: Ensure app has background refresh permissions
4. **Manual Refresh**: Use refresh buttons where available

### Getting Help

#### Support Options

1. **In-App Help**: Navigate to **More** > **Help** for contextual assistance
2. **Report Issue**: Use **More** > **Report Issue** to submit support requests
3. **System Administrator**: Contact your organization's LabWatch administrator
4. **Documentation**: Reference this manual for detailed instructions

#### Before Contacting Support

Gather the following information:
- **Device Type**: iOS or Android device model
- **App Version**: Check in **More** > **About**
- **Error Messages**: Screenshots of any error messages
- **Steps to Reproduce**: What actions led to the problem
- **User Account**: Your email address and permission level

**[Image Placeholder: Support Contact Information]**

---

## 13. Emergency Procedures

### Emergency Response Protocol

LabWatch includes features designed to help you respond quickly and effectively to laboratory emergencies.

**[Image Placeholder: Emergency Response Interface]**

### Critical Alert Response

When a critical alert is triggered:

1. **Immediate Assessment**
   - Review alert details and severity
   - Identify affected room and sensor type
   - Check if anyone is currently in the affected area

2. **Safety First**
   - Evacuate personnel if necessary
   - Follow laboratory-specific safety protocols
   - Ensure all safety equipment is accessible

3. **Alert Management**
   - Acknowledge the alert to stop notifications
   - Create an incident report for documentation
   - Notify relevant personnel and supervisors

4. **Corrective Action**
   - Address the root cause of the alert
   - Monitor sensor readings for improvement
   - Document all actions taken

**[Image Placeholder: Emergency Response Flowchart]**

### Emergency Contacts

#### Accessing Emergency Information

1. Navigate to **More** > **Emergency Procedures**
2. View pre-configured emergency contacts
3. Access quick-dial emergency numbers
4. Review laboratory-specific emergency procedures

#### Emergency Contact Types

- **Fire Department**: Local fire emergency services
- **Poison Control**: Chemical exposure assistance
- **Campus Security**: University/facility security
- **Environmental Health & Safety**: Institutional EHS office
- **Laboratory Supervisor**: Direct supervisor contact
- **Facilities Management**: Building systems and utilities

**[Image Placeholder: Emergency Contacts Screen]**

### Incident Escalation

#### When to Escalate

Escalate incidents when:
- **Critical Alerts Persist**: Readings remain in dangerous ranges
- **Multiple Sensor Failures**: Widespread system issues
- **Personnel Safety Risk**: Immediate danger to individuals
- **Equipment Damage**: Significant equipment malfunction
- **Chemical Spills**: Hazardous material incidents

#### Escalation Process

1. **Immediate Response**
   - Ensure personnel safety
   - Document initial findings
   - Take immediate corrective action if safe to do so

2. **Notification**
   - Contact appropriate emergency services
   - Notify laboratory supervisor
   - Alert facility management if needed
   - Use LabWatch emergency contact features

3. **Documentation**
   - Create detailed incident report in LabWatch
   - Include timeline of events
   - Document all personnel involved
   - Record corrective actions taken

### Chemical Emergency Procedures

#### Hazardous Vapor Detection

If air quality sensors detect dangerous levels:
1. **Immediate Evacuation**: Leave the area immediately
2. **Ventilation**: Activate emergency ventilation if available
3. **Source Control**: Identify and secure chemical source if safely possible
4. **Medical Attention**: Seek medical evaluation for exposure symptoms

#### Temperature Emergencies

**High Temperature Alerts**
- Check for fire or equipment overheating
- Activate suppression systems if available
- Evacuate if fire is suspected
- Contact fire department for temperatures >50°C

**Low Temperature Alerts**
- Check for HVAC system failure
- Protect temperature-sensitive materials
- Consider equipment damage risk
- Contact facilities management

### Equipment Failure Response

#### Sensor System Failure

When sensors go offline or show clearly erroneous readings:
1. **Switch to Manual Monitoring**: Use backup measurement devices
2. **Increase Inspection Frequency**: More frequent visual checks
3. **Notify Maintenance**: Report equipment failure immediately
4. **Document Downtime**: Record when systems are non-functional

#### Communication System Failure

If LabWatch alerts are not functioning:
1. **Backup Communication**: Use alternative notification methods
2. **Increased Vigilance**: More frequent manual checks
3. **System Restart**: Attempt to restore alert functionality
4. **Technical Support**: Contact system administrators

### Documentation Requirements

#### Emergency Documentation

All emergencies must be documented with:
- **Incident Report**: Complete LabWatch incident record
- **Timeline**: Chronological sequence of events
- **Personnel Involved**: All individuals present or responding
- **Actions Taken**: Detailed corrective measures
- **Outcome**: Resolution and lessons learned

#### Regulatory Compliance

Ensure documentation meets:
- **OSHA Requirements**: Workplace safety regulations
- **EPA Standards**: Environmental protection requirements
- **Institutional Policies**: University or facility-specific rules
- **Insurance Requirements**: Documentation for claims processing

**[Image Placeholder: Emergency Documentation Template]**

### Recovery Procedures

#### Post-Emergency Assessment

After resolving an emergency:
1. **System Check**: Verify all sensors are functioning properly
2. **Calibration**: Recalibrate sensors if necessary
3. **Review**: Analyze response effectiveness
4. **Improvement**: Update procedures based on lessons learned

#### Return to Normal Operations

1. **Safety Clearance**: Confirm area is safe for reoccupation
2. **System Verification**: Test all monitoring systems
3. **Personnel Briefing**: Update staff on any changes
4. **Monitoring**: Increased observation during initial return period

---

## 14. Appendix

### Sensor Specifications

#### SHT20 Temperature & Humidity Sensor

**Technical Specifications:**
- Temperature Range: -40°C to +125°C
- Temperature Accuracy: ±0.3°C (typical)
- Humidity Range: 0% to 100% RH
- Humidity Accuracy: ±3% RH (typical)
- Response Time: 5-30 seconds
- Operating Voltage: 2.1V to 3.6V
- Communication Protocol: I2C

**[Image Placeholder: SHT20 Sensor Diagram]**

#### SDS011 Air Quality Sensor

**Technical Specifications:**
- PM2.5 Range: 0-999 μg/m³
- PM10 Range: 0-999 μg/m³
- Resolution: 0.3 μg/m³
- Accuracy: ±10% (25°C, 50% RH)
- Response Time: 1 second
- Operating Temperature: -10°C to +50°C
- Operating Humidity: 0% to 70% RH
- Communication Protocol: UART

**[Image Placeholder: SDS011 Sensor Diagram]**

#### AMG8833 Thermal Imaging Sensor

**Technical Specifications:**
- Array Size: 8×8 pixels
- Temperature Range: 0°C to 80°C
- Accuracy: ±2.5°C (typical)
- Frame Rate: 10 FPS
- Field of View: 60°
- Operating Temperature: -20°C to +80°C
- Communication Protocol: I2C

**[Image Placeholder: AMG8833 Sensor Diagram]**

#### MPU6050 Vibration Sensor

**Technical Specifications:**
- Accelerometer Range: ±2g, ±4g, ±8g, ±16g
- Gyroscope Range: ±250°/s, ±500°/s, ±1000°/s, ±2000°/s
- Accelerometer Sensitivity: 16,384 LSB/g (±2g setting)
- Operating Temperature: -40°C to +85°C
- Communication Protocol: I2C

**[Image Placeholder: MPU6050 Sensor Diagram]**

### Alert Threshold Reference

#### Temperature Thresholds
- **Critical High**: >35°C
- **High**: >30°C
- **Normal Range**: 15°C to 30°C
- **Low**: <15°C
- **Critical Low**: <10°C

#### Humidity Thresholds
- **High**: >70% RH
- **Normal Range**: 30% to 70% RH
- **Low**: <30% RH

#### Air Quality Thresholds (PM2.5)
- **Hazardous**: >250.5 μg/m³
- **Very Unhealthy**: >150.5 μg/m³
- **Unhealthy**: >55.5 μg/m³
- **Moderate**: >12.1 μg/m³
- **Good**: 0-12.0 μg/m³

#### Air Quality Thresholds (PM10)
- **Hazardous**: >424 μg/m³
- **Very Unhealthy**: >354 μg/m³
- **Unhealthy**: >154 μg/m³
- **Moderate**: >54 μg/m³
- **Good**: 0-54 μg/m³

#### Thermal Imaging Thresholds
- **Critical Anomaly**: Max >50°C or Average >35°C
- **High Anomaly**: Max >45°C or Ave~rage >30°C
- **Normal**: Below anomaly thresholds

#### Vibration Thresholds
- **Critical**: >5.0g RMS
- **High**: >3.0g RMS
- **Medium**: >1.5g RMS
- **Normal**: <1.5g RMS

### API Documentation

#### Authentication

**Endpoint**: `/api/auth/login`
**Method**: POST
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response**:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "user|admin"
  }
}
```

#### Real-time Data Access

**Firebase Realtime Database Path Structure**:
```
esp32_devices_data/
  └── {moduleId}/
      └── latest/
          ├── timestamp
          ├── sht20/
          │   ├── temperature
          │   └── humidity
          ├── sds011/
          │   ├── pm2_5
          │   └── pm10
          ├── amg8833/
          │   └── pixels/
          └── mpu6050/
              ├── ax
              ├── ay
              └── az
```

#### Alert API

**Get Alerts Endpoint**: `/api/alerts`
**Method**: GET
**Query Parameters**:
- `severity`: Filter by alert severity
- `room`: Filter by room ID
- `acknowledged`: Filter by acknowledgment status

### Frequently Asked Questions

#### Q: How often is sensor data updated?
**A:** Sensor data is updated in real-time as it's received from ESP32 devices, typically every 5-30 seconds depending on the sensor type and configuration.

#### Q: Can I customize alert thresholds?
**A:** Yes, administrators can modify alert thresholds through the system configuration interface. Contact your system administrator to adjust thresholds for your specific needs.

#### Q: What happens if the internet connection is lost?
**A:** ESP32 devices store data locally during internet outages and sync when connectivity is restored. The mobile app will show the last known data until new data is available.

#### Q: How long is historical data stored?
**A:** Data retention periods are configurable by administrators. Typically, real-time sensor data is kept for 30-90 days, while alert and incident records are retained for 1-7 years depending on compliance requirements.

#### Q: Can multiple people monitor the same room?
**A:** Yes, multiple users can simultaneously monitor the same rooms. Alert notifications are sent to all users with access to the affected room.

#### Q: Is there a limit to the number of cameras per room?
**A:** There's no hard limit, but performance may be affected with many simultaneous video streams. Typically 2-4 cameras per room provide optimal performance.

#### Q: How accurate is the people detection feature?
**A:** People detection accuracy varies based on lighting conditions, camera quality, and environmental factors. Typical accuracy ranges from 85-95% under optimal conditions.

#### Q: Can I export data for analysis?
**A:** Yes, the data export feature allows you to download sensor data, alerts, and incidents in various formats (CSV, JSON, PDF) for external analysis.

### Glossary

**Alert**: Automated notification triggered when sensor readings exceed predefined thresholds

**ESP32**: Microcontroller development board used to connect and manage laboratory sensors

**Incident**: Formal record of a safety event or significant occurrence requiring documentation

**Real-time Database**: Firebase service providing live data synchronization across all connected devices

**RMS**: Root Mean Square - mathematical method for calculating average acceleration in vibration monitoring

**Sensor**: Electronic device that measures environmental conditions (temperature, humidity, air quality, etc.)

**Threshold**: Predefined limit that triggers an alert when exceeded by sensor readings

**AQI**: Air Quality Index - standardized measurement of air pollution levels

**PM2.5/PM10**: Particulate matter with diameter less than 2.5/10 micrometers

**Thermal Imaging**: Technology that captures heat patterns using infrared radiation

### Version History

#### Version 1.0.0 (Current)
- Initial release with core monitoring features
- Real-time sensor data display
- Alert system with customizable thresholds
- Incident management system
- AI-powered people detection
- Multi-room monitoring support
- Role-based access control

#### Planned Updates
- Enhanced AI analytics and predictions
- Integration with additional sensor types
- Advanced reporting and dashboard features
- Mobile offline mode support
- Enhanced security features

### Contact Information

**Technical Support**: [Your Support Email]
**System Administrator**: [Admin Contact]
**Emergency Contact**: [Emergency Phone Number]
**Documentation Updates**: [Documentation Contact]

**App Version**: 1.0.0
**Manual Version**: 1.0.0
**Last Updated**: [Current Date]

---

*This manual is a living document and will be updated as new features are added to the LabWatch application. Please check for the latest version periodically.*

**[Image Placeholder: LabWatch Logo and Copyright Information]**
