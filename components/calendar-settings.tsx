"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  LANGUAGES, 
  COUNTRIES, 
  TIMEZONES, 
  DATE_FORMATS, 
  TIME_FORMATS, 
  START_WEEK_OPTIONS, 
  ALTERNATE_CALENDARS, 
  EVENT_DURATIONS,
  NOTIFICATION_TIMES,
  THEMES,
  COLOR_SETS,
  DENSITY_OPTIONS,
  CALENDAR_COLORS,
  KEYBOARD_SHORTCUTS
} from "@/lib/calendar-settings-data"
import { 
  ArrowLeft, 
  ChevronRight,
  Globe,
  Clock,
  Bell,
  Eye,
  Keyboard,
  Moon,
  Import,
  Download,
  Settings,
  Calendar,
  Users,
  Plus,
  X,
  FileText,
  Palette,
  Monitor,
  HelpCircle
} from "lucide-react"

interface CalendarSettingsProps {
  onClose: () => void
}

export function CalendarSettings({ onClose }: CalendarSettingsProps) {
  const [selectedSection, setSelectedSection] = useState<string>('general')
  const [settings, setSettings] = useState({
    // Language & Region
    language: 'English (United States)',
    country: 'United States',
    dateFormat: 'M/d/yyyy',
    timeFormat: '12-hour',
    
    // Time Zone
    primaryTimeZone: '(GMT-05:00) Eastern Time - New York',
    secondaryTimeZone: '',
    showSecondaryTimeZone: false,
    askToUpdateTimeZone: true,
    
    // World Clock
    showWorldClock: false,
    worldClockTimezones: [],
    
    // Event Settings
    defaultEventLength: 60,
    speedyMeetings: false,
    guestPermissions: {
      modifyEvent: false,
      inviteOthers: true,
      seeGuestList: true
    },
    
    // Notification Settings
    eventNotifications: true,
    allDayEventNotifications: true,
    
    // View Options
    startWeek: 'Sunday',
    showDeclinedEvents: false,
    showWeekends: true,
    showTasks: true,
    reduceVisualClutter: false,
    alternateCalendar: 'None',
    viewCalendarsSideBySide: false,
    
    // Smart Features
    enableSmartFeatures: true,
    enableEventsFromGmail: true,
    
    // Working Hours
    workingHours: {
      enabled: false,
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: '09:00', end: '17:00' },
      sunday: { enabled: false, start: '09:00', end: '17:00' }
    },
    
    // Keyboard Shortcuts
    enableKeyboardShortcuts: true,
    
    // Offline
    enableOfflineAccess: false,
    
    // Appearance
    theme: 'System default',
    density: 'Responsive',
    colorSet: 'Modern'
  })

  const sidebarSections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'calendars', label: 'Settings for my calendars', icon: Calendar, subsections: [
      { id: 'personal', label: 'Personal' },
      { id: 'work', label: 'Work' },
      { id: 'holidays', label: 'Holidays in United States' }
    ]},
    { id: 'add-calendar', label: 'Add calendar', icon: Plus },
    { id: 'import-export', label: 'Import & export', icon: Import },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'trash', label: 'Trash', icon: X }
  ]

  const renderGeneralSettings = () => (
    <div className="max-w-2xl">
      <h2 className="text-xl font-normal text-[#3c4043] mb-6">General</h2>
      
      {/* Language and region */}
      <div className="mb-8">
        <h3 className="text-base font-medium text-[#3c4043] mb-4">Language and region</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#5f6368] mb-1">Language</label>
            <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.label}>{lang.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm text-[#5f6368] mb-1">Country</label>
            <Select value={settings.country} onValueChange={(value) => setSettings(prev => ({ ...prev, country: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.value} value={country.label}>{country.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm text-[#5f6368] mb-1">Date format</label>
            <Select value={settings.dateFormat} onValueChange={(value) => setSettings(prev => ({ ...prev, dateFormat: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>{format.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm text-[#5f6368] mb-1">Time format</label>
            <Select value={settings.timeFormat} onValueChange={(value) => setSettings(prev => ({ ...prev, timeFormat: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>{format.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Time zone */}
      <div className="mb-8">
        <h3 className="text-base font-medium text-[#3c4043] mb-4">Time zone</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Switch 
              checked={settings.showSecondaryTimeZone}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showSecondaryTimeZone: checked }))}
            />
            <span className="text-sm text-[#3c4043]">Display secondary time zone</span>
          </div>
          
          <div>
            <label className="block text-sm text-[#5f6368] mb-1">Primary time zone</label>
            <Select value={settings.primaryTimeZone} onValueChange={(value) => setSettings(prev => ({ ...prev, primaryTimeZone: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {TIMEZONES.map((timezone) => (
                  <SelectItem key={timezone.value} value={timezone.label}>{timezone.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Label" className="mt-2" />
          </div>
          
          {settings.showSecondaryTimeZone && (
            <div>
              <label className="block text-sm text-[#5f6368] mb-1">Secondary time zone</label>
              <Select value={settings.secondaryTimeZone} onValueChange={(value) => setSettings(prev => ({ ...prev, secondaryTimeZone: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Not selected" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {TIMEZONES.map((timezone) => (
                    <SelectItem key={timezone.value} value={timezone.label}>{timezone.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Label" className="mt-2" />
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <Switch 
              checked={settings.askToUpdateTimeZone}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, askToUpdateTimeZone: checked }))}
            />
            <span className="text-sm text-[#3c4043]">Ask to update my primary time zone to current location</span>
          </div>
          
          <p className="text-xs text-[#5f6368]">
            Learn more about how Google Calendar works across <a href="#" className="text-[#1a73e8] hover:underline">time zones</a>
          </p>
        </div>
      </div>

      {/* World clock */}
      <div className="mb-8">
        <h3 className="text-base font-medium text-[#3c4043] mb-4">World clock</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Switch 
              checked={settings.showWorldClock}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showWorldClock: checked }))}
            />
            <span className="text-sm text-[#3c4043]">Show world clock</span>
          </div>
          
          {settings.showWorldClock && (
            <div className="space-y-4">
              {/* Current world clocks */}
              <div className="space-y-2">
                {settings.worldClockTimezones.map((clock, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-[#dadce0] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-4 h-4 text-[#5f6368]" />
                      <div>
                        <span className="text-sm text-[#3c4043]">{clock.label}</span>
                        <p className="text-xs text-[#5f6368]">
                          {new Date().toLocaleTimeString('en-US', { 
                            timeZone: clock.timezone,
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: settings.timeFormat === '12-hour'
                          })}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-[#5f6368] hover:bg-[#f1f3f4]"
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        worldClockTimezones: prev.worldClockTimezones.filter((_, i) => i !== index)
                      }))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {/* Add timezone */}
              <div className="border-2 border-dashed border-[#dadce0] rounded-lg p-4">
                <Select onValueChange={(value) => {
                  const timezone = TIMEZONES.find(tz => tz.value === value)
                  if (timezone) {
                    setSettings(prev => ({
                      ...prev,
                      worldClockTimezones: [
                        ...prev.worldClockTimezones,
                        { timezone: timezone.value, label: timezone.label.split(') ')[1] || timezone.label }
                      ]
                    }))
                  }
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Add time zone" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {TIMEZONES.filter(tz => 
                      !settings.worldClockTimezones.some(clock => clock.timezone === tz.value)
                    ).map((timezone) => (
                      <SelectItem key={timezone.value} value={timezone.value}>{timezone.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <p className="text-xs text-[#5f6368]">
            In the main menu of Calendar, you can show the current time in different locations around the world. This makes it easier to schedule meetings across time zones.
          </p>
        </div>
      </div>

      {/* Event settings */}
      <div className="mb-8">
        <h3 className="text-base font-medium text-[#3c4043] mb-4">Event settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#5f6368] mb-1">Default event length</label>
            <Select value={settings.defaultEventLength.toString()} onValueChange={(value) => setSettings(prev => ({ ...prev, defaultEventLength: parseInt(value) }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_DURATIONS.map((duration) => (
                  <SelectItem key={duration.value} value={duration.value.toString()}>{duration.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-3">
            <Switch 
              checked={settings.speedyMeetings}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, speedyMeetings: checked }))}
            />
            <div>
              <span className="text-sm text-[#3c4043]">Speedy meetings</span>
              <p className="text-xs text-[#5f6368]">End meetings 5-10 minutes early</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-[#3c4043] mb-2">Default guest permissions</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Switch 
                  checked={settings.guestPermissions.modifyEvent}
                  onCheckedChange={(checked) => setSettings(prev => ({ 
                    ...prev, 
                    guestPermissions: { ...prev.guestPermissions, modifyEvent: checked }
                  }))}
                />
                <span className="text-sm text-[#3c4043]">Modify event</span>
              </div>
              <div className="flex items-center space-x-3">
                <Switch 
                  checked={settings.guestPermissions.inviteOthers}
                  onCheckedChange={(checked) => setSettings(prev => ({ 
                    ...prev, 
                    guestPermissions: { ...prev.guestPermissions, inviteOthers: checked }
                  }))}
                />
                <span className="text-sm text-[#3c4043]">Invite others</span>
              </div>
              <div className="flex items-center space-x-3">
                <Switch 
                  checked={settings.guestPermissions.seeGuestList}
                  onCheckedChange={(checked) => setSettings(prev => ({ 
                    ...prev, 
                    guestPermissions: { ...prev.guestPermissions, seeGuestList: checked }
                  }))}
                />
                <span className="text-sm text-[#3c4043]">See guest list</span>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-[#5f6368]">
            When you create a new event, you can set a default duration and guest permissions. You can also <a href="#" className="text-[#1a73e8] hover:underline">manage incoming invitations from senders</a>.
          </p>
        </div>
      </div>

      {/* Notification settings */}
      <div className="mb-8">
        <h3 className="text-base font-medium text-[#3c4043] mb-4">Notification settings</h3>
        <div className="space-y-6">
          {/* Desktop notifications */}
          <div>
            <h4 className="text-sm font-medium text-[#3c4043] mb-3">Desktop notifications</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Switch 
                  checked={settings.eventNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, eventNotifications: checked }))}
                />
                <span className="text-sm text-[#3c4043]">Show notifications</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Switch 
                  checked={settings.allDayEventNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allDayEventNotifications: checked }))}
                />
                <span className="text-sm text-[#3c4043]">Show notifications for all-day events</span>
              </div>
              
              <div className="ml-6">
                <label className="block text-sm text-[#5f6368] mb-1">Default notification time</label>
                <Select defaultValue="10">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_TIMES.map((time) => (
                      <SelectItem key={time.value} value={time.value.toString()}>{time.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Email notifications */}
          <div>
            <h4 className="text-sm font-medium text-[#3c4043] mb-3">Email notifications</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Switch defaultChecked />
                <span className="text-sm text-[#3c4043]">Send email notifications</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Switch defaultChecked />
                <span className="text-sm text-[#3c4043]">Daily agenda</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Switch />
                <span className="text-sm text-[#3c4043]">Weekly agenda</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Switch />
                <span className="text-sm text-[#3c4043]">New invitations</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Switch />
                <span className="text-sm text-[#3c4043]">Changed events</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Switch />
                <span className="text-sm text-[#3c4043]">Cancelled events</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Switch />
                <span className="text-sm text-[#3c4043]">Event responses</span>
              </div>
            </div>
          </div>
          
          {/* Mobile notifications */}
          <div>
            <h4 className="text-sm font-medium text-[#3c4043] mb-3">Mobile notifications</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Switch defaultChecked />
                <span className="text-sm text-[#3c4043]">Push notifications</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Switch />
                <span className="text-sm text-[#3c4043]">Notification sounds</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Switch />
                <span className="text-sm text-[#3c4043]">Vibration</span>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-[#5f6368]">
            Change notification settings and sounds for upcoming events. <a href="#" className="text-[#1a73e8] hover:underline">Learn how to change notifications</a>.
          </p>
        </div>
      </div>

      {/* View options */}
      <div className="mb-8">
        <h3 className="text-base font-medium text-[#3c4043] mb-4">View options</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#5f6368] mb-1">Start week on</label>
            <Select value={settings.startWeek} onValueChange={(value) => setSettings(prev => ({ ...prev, startWeek: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {START_WEEK_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-3">
            <Switch 
              checked={settings.showDeclinedEvents}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showDeclinedEvents: checked }))}
            />
            <span className="text-sm text-[#3c4043]">Show declined events</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Switch 
              checked={settings.showWeekends}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showWeekends: checked }))}
            />
            <span className="text-sm text-[#3c4043]">Show weekends</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Switch 
              checked={settings.showTasks}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showTasks: checked }))}
            />
            <span className="text-sm text-[#3c4043]">Show tasks</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Switch 
              checked={settings.reduceVisualClutter}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, reduceVisualClutter: checked }))}
            />
            <span className="text-sm text-[#3c4043]">Reduce the brightness of past events</span>
          </div>
          
          <div>
            <label className="block text-sm text-[#5f6368] mb-1">Alternate calendar</label>
            <Select value={settings.alternateCalendar} onValueChange={(value) => setSettings(prev => ({ ...prev, alternateCalendar: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALTERNATE_CALENDARS.map((calendar) => (
                  <SelectItem key={calendar.value} value={calendar.value}>{calendar.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-3">
            <Switch 
              checked={settings.viewCalendarsSideBySide}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, viewCalendarsSideBySide: checked }))}
            />
            <span className="text-sm text-[#3c4043]">View calendars side by side in Day View</span>
          </div>
          
          <p className="text-xs text-[#5f6368]">
            Update the look of your calendar, such as <a href="#" className="text-[#1a73e8] hover:underline">the first day of your week</a>.
          </p>
        </div>
      </div>

      {/* Google Workspace smart features */}
      <div className="mb-8">
        <h3 className="text-base font-medium text-[#3c4043] mb-4">Google Workspace smart features</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Switch 
              checked={settings.enableSmartFeatures}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableSmartFeatures: checked }))}
            />
            <span className="text-sm text-[#3c4043]">Smart features and personalization</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Switch 
              checked={settings.enableEventsFromGmail}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableEventsFromGmail: checked }))}
            />
            <span className="text-sm text-[#3c4043]">Events from Gmail</span>
          </div>
          
          <p className="text-xs text-[#5f6368]">
            Choose to personalize your experience with smart features across Workspace and other Google products. Workspace includes Google apps for businesses and school, such as Calendar, Gmail, Chat, Meet, and Drive. <a href="#" className="text-[#1a73e8] hover:underline">Learn about Google Workspace smart features</a>.
          </p>
        </div>
      </div>

      {/* Working hours & location */}
      <div className="mb-8">
        <h3 className="text-base font-medium text-[#3c4043] mb-4">Working hours & location</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Switch 
              checked={settings.workingHours.enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ 
                ...prev, 
                workingHours: { ...prev.workingHours, enabled: checked }
              }))}
            />
            <span className="text-sm text-[#3c4043]">Enable working hours</span>
          </div>
          
                     {settings.workingHours.enabled && (
             <div className="ml-6 space-y-4">
               {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => {
                 const daySettings = settings.workingHours[day]
                 return (
                   <div key={day} className="flex items-center space-x-4">
                     <div className="w-20 text-sm text-[#3c4043] capitalize">{day}</div>
                     <Switch 
                       checked={daySettings.enabled}
                       onCheckedChange={(checked) => setSettings(prev => ({ 
                         ...prev, 
                         workingHours: { 
                           ...prev.workingHours, 
                           [day]: { ...prev.workingHours[day], enabled: checked }
                         }
                       }))}
                     />
                     {daySettings.enabled && (
                       <>
                         <Input 
                           type="time" 
                           value={daySettings.start}
                           className="w-24"
                           onChange={(e) => setSettings(prev => ({ 
                             ...prev, 
                             workingHours: { 
                               ...prev.workingHours, 
                               [day]: { ...prev.workingHours[day], start: e.target.value }
                             }
                           }))}
                         />
                         <span className="text-sm text-[#5f6368]">to</span>
                         <Input 
                           type="time" 
                           value={daySettings.end}
                           className="w-24"
                           onChange={(e) => setSettings(prev => ({ 
                             ...prev, 
                             workingHours: { 
                               ...prev.workingHours, 
                               [day]: { ...prev.workingHours[day], end: e.target.value }
                             }
                           }))}
                         />
                       </>
                     )}
                   </div>
                 )
               })}
             </div>
           )}
          
          <p className="text-xs text-[#5f6368]">
            If you have a work or school account with an eligible Google Workspace subscription, you can let others know your availability when they try to schedule a meeting with you. <a href="#" className="text-[#1a73e8] hover:underline">Show your working hours and location</a>.
          </p>
        </div>
      </div>

      {/* Appointment schedules */}
      <div className="mb-8">
        <h3 className="text-base font-medium text-[#3c4043] mb-4">Appointment schedules</h3>
        <p className="text-sm text-[#5f6368] mb-4">
          If you have a work or school account with an eligible Google Workspace subscription, after you connect to Stripe, you can <a href="#" className="text-[#1a73e8] hover:underline">require payments for appointments that you create</a>.
        </p>
      </div>

      {/* Keyboard shortcuts */}
      <div className="mb-8">
        <h3 className="text-base font-medium text-[#3c4043] mb-4">Keyboard shortcuts</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Switch 
              checked={settings.enableKeyboardShortcuts}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableKeyboardShortcuts: checked }))}
            />
            <span className="text-sm text-[#3c4043]">Enable keyboard shortcuts</span>
          </div>
          
          {settings.enableKeyboardShortcuts && (
            <div className="border border-[#dadce0] rounded-lg p-4">
              <h4 className="text-sm font-medium text-[#3c4043] mb-3">Available shortcuts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="text-sm text-[#3c4043]">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-[#f8f9fa] border border-[#dadce0] rounded">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <p className="text-xs text-[#5f6368]">
            To navigate around your calendar, use your keyboard. To show a list of available shortcuts, on your keyboard, press <strong>?</strong>. <a href="#" className="text-[#1a73e8] hover:underline">Learn more about keyboard shortcuts</a>.
          </p>
        </div>
      </div>

      {/* Offline */}
      <div className="mb-8">
        <h3 className="text-base font-medium text-[#3c4043] mb-4">Offline</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Switch 
              checked={settings.enableOfflineAccess}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableOfflineAccess: checked }))}
            />
            <span className="text-sm text-[#3c4043]">Enable offline support</span>
          </div>
          
          <p className="text-xs text-[#5f6368]">
            Use your primary calendar when you're offline. You can't use other calendars or Tasks without an internet connection. <a href="#" className="text-[#1a73e8] hover:underline">Learn how to use Calendar offline</a>.
          </p>
        </div>
      </div>
    </div>
  )

  const renderCalendarSettings = () => (
    <div className="max-w-2xl">
      <h2 className="text-xl font-normal text-[#3c4043] mb-6">Settings for my calendars</h2>
      
      <div className="space-y-4">
        <div className="border border-[#dadce0] rounded-lg p-4 hover:bg-[#f8f9fa] cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-[#1a73e8] rounded-full"></div>
              <div>
                <span className="text-sm font-medium text-[#3c4043]">Personal</span>
                <p className="text-xs text-[#5f6368]">your.email@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-[#5f6368] hover:bg-[#f1f3f4]">
                Share
              </Button>
              <ChevronRight className="w-4 h-4 text-[#5f6368]" />
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-3">
              <Switch defaultChecked />
              <span className="text-xs text-[#3c4043]">Show calendar</span>
            </div>
            
            <div>
              <label className="block text-xs text-[#5f6368] mb-1">Calendar color</label>
              <div className="flex space-x-2">
                {CALENDAR_COLORS.slice(0, 6).map((color) => (
                  <button
                    key={color.value}
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Switch />
              <span className="text-xs text-[#3c4043]">Default notifications</span>
            </div>
          </div>
        </div>
        
        <div className="border border-[#dadce0] rounded-lg p-4 hover:bg-[#f8f9fa] cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-[#0d7377] rounded-full"></div>
              <div>
                <span className="text-sm font-medium text-[#3c4043]">Work</span>
                <p className="text-xs text-[#5f6368]">work.email@company.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-[#5f6368] hover:bg-[#f1f3f4]">
                Share
              </Button>
              <ChevronRight className="w-4 h-4 text-[#5f6368]" />
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-3">
              <Switch defaultChecked />
              <span className="text-xs text-[#3c4043]">Show calendar</span>
            </div>
            
            <div>
              <label className="block text-xs text-[#5f6368] mb-1">Calendar color</label>
              <div className="flex space-x-2">
                {CALENDAR_COLORS.slice(0, 6).map((color) => (
                  <button
                    key={color.value}
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Switch defaultChecked />
              <span className="text-xs text-[#3c4043]">Default notifications</span>
            </div>
          </div>
        </div>
        
        <div className="border border-[#dadce0] rounded-lg p-4 hover:bg-[#f8f9fa] cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-[#e8710a] rounded-full"></div>
              <div>
                <span className="text-sm font-medium text-[#3c4043]">Holidays in United States</span>
                <p className="text-xs text-[#5f6368]">Provided by Google</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#5f6368]" />
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-3">
              <Switch defaultChecked />
              <span className="text-xs text-[#3c4043]">Show calendar</span>
            </div>
            
            <div>
              <label className="block text-xs text-[#5f6368] mb-1">Calendar color</label>
              <div className="flex space-x-2">
                {CALENDAR_COLORS.slice(0, 6).map((color) => (
                  <button
                    key={color.value}
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="border border-[#dadce0] rounded-lg p-4 hover:bg-[#f8f9fa] cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-[#7986cb] rounded-full"></div>
              <div>
                <span className="text-sm font-medium text-[#3c4043]">Birthdays</span>
                <p className="text-xs text-[#5f6368]">From your contacts</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#5f6368]" />
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-3">
              <Switch />
              <span className="text-xs text-[#3c4043]">Show calendar</span>
            </div>
            
            <div>
              <label className="block text-xs text-[#5f6368] mb-1">Calendar color</label>
              <div className="flex space-x-2">
                {CALENDAR_COLORS.slice(0, 6).map((color) => (
                  <button
                    key={color.value}
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAddCalendar = () => (
    <div className="max-w-2xl">
      <h2 className="text-xl font-normal text-[#3c4043] mb-6">Add calendar</h2>
      
      <div className="space-y-4">
        <button className="w-full text-left border border-[#dadce0] rounded-lg p-4 hover:bg-[#f8f9fa]">
          <div className="flex items-center space-x-3">
            <Plus className="w-5 h-5 text-[#5f6368]" />
            <div>
              <div className="text-sm font-medium text-[#3c4043]">Create new calendar</div>
              <div className="text-xs text-[#5f6368]">Create a calendar for a specific purpose</div>
            </div>
          </div>
        </button>
        
        <button className="w-full text-left border border-[#dadce0] rounded-lg p-4 hover:bg-[#f8f9fa]">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-[#5f6368]" />
            <div>
              <div className="text-sm font-medium text-[#3c4043]">Subscribe to calendar</div>
              <div className="text-xs text-[#5f6368]">Add a calendar using a link</div>
            </div>
          </div>
        </button>
        
        <button className="w-full text-left border border-[#dadce0] rounded-lg p-4 hover:bg-[#f8f9fa]">
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-[#5f6368]" />
            <div>
              <div className="text-sm font-medium text-[#3c4043]">Browse calendars of interest</div>
              <div className="text-xs text-[#5f6368]">Find calendars for sports teams, holidays, and more</div>
            </div>
          </div>
        </button>
        
        <button className="w-full text-left border border-[#dadce0] rounded-lg p-4 hover:bg-[#f8f9fa]">
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-[#5f6368]" />
            <div>
              <div className="text-sm font-medium text-[#3c4043]">From URL</div>
              <div className="text-xs text-[#5f6368]">Add a calendar using a URL</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  )

  const renderImportExport = () => (
    <div className="max-w-2xl">
      <h2 className="text-xl font-normal text-[#3c4043] mb-6">Import & export</h2>
      
      <div className="space-y-8">
        {/* Import */}
        <div>
          <h3 className="text-base font-medium text-[#3c4043] mb-4">Import</h3>
          <div className="border-2 border-dashed border-[#dadce0] rounded-lg p-8 text-center">
            <Import className="w-8 h-8 text-[#5f6368] mx-auto mb-4" />
            <Button variant="outline" className="text-[#1a73e8] border-[#1a73e8] hover:bg-[#e8f0fe]">
              Select file from your computer
            </Button>
            <p className="text-sm text-[#5f6368] mt-4">
              You can import event information in iCalendar (ICS/VCS) or CSV format.
            </p>
          </div>
        </div>
        
        {/* Export */}
        <div>
          <h3 className="text-base font-medium text-[#3c4043] mb-4">Export</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3 p-3 border border-[#dadce0] rounded-lg">
                <div className="w-4 h-4 bg-[#1a73e8] rounded-full"></div>
                <span className="text-sm text-[#3c4043]">Personal</span>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-[#dadce0] rounded-lg">
                <div className="w-4 h-4 bg-[#0d7377] rounded-full"></div>
                <span className="text-sm text-[#3c4043]">Work</span>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-[#dadce0] rounded-lg">
                <div className="w-4 h-4 bg-[#e8710a] rounded-full"></div>
                <span className="text-sm text-[#3c4043]">Holidays in United States</span>
              </div>
            </div>
            <p className="text-sm text-[#5f6368]">
              You can download all calendars you can view and modify in a single archive.
            </p>
            <Button variant="outline" className="text-[#1a73e8] border-[#1a73e8] hover:bg-[#e8f0fe]">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAppearance = () => (
    <div className="max-w-2xl">
      <h2 className="text-xl font-normal text-[#3c4043] mb-6">Appearance</h2>
      
      <div className="space-y-8">
        {/* Theme */}
        <div>
          <h3 className="text-base font-medium text-[#3c4043] mb-4">Theme</h3>
          <div>
            <Select value={settings.theme} onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>{theme.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Color set */}
        <div>
          <h3 className="text-base font-medium text-[#3c4043] mb-4">Color set</h3>
          <div>
            <Select value={settings.colorSet} onValueChange={(value) => setSettings(prev => ({ ...prev, colorSet: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLOR_SETS.map((colorSet) => (
                  <SelectItem key={colorSet.value} value={colorSet.value}>{colorSet.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-[#5f6368] mt-2">
              To change the color set, set your background to "Light."
            </p>
          </div>
        </div>
        
        {/* Density */}
        <div>
          <h3 className="text-base font-medium text-[#3c4043] mb-4">Density</h3>
          <div>
            <Select value={settings.density} onValueChange={(value) => setSettings(prev => ({ ...prev, density: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DENSITY_OPTIONS.map((density) => (
                  <SelectItem key={density.value} value={density.value}>{density.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-[#5f6368] mt-2">
              Your calendar resizes to fit your screen.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTrash = () => (
    <div className="max-w-2xl">
      <h2 className="text-xl font-normal text-[#3c4043] mb-6">Trash</h2>
      
      <div className="text-center py-12">
        <X className="w-12 h-12 text-[#5f6368] mx-auto mb-4" />
        <p className="text-sm text-[#5f6368]">No deleted calendars</p>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (selectedSection) {
      case 'general':
        return renderGeneralSettings()
      case 'calendars':
        return renderCalendarSettings()
      case 'add-calendar':
        return renderAddCalendar()
      case 'import-export':
        return renderImportExport()
      case 'appearance':
        return renderAppearance()
      case 'trash':
        return renderTrash()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-6xl h-[90vh] bg-white rounded-lg shadow-xl flex overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sidebar */}
          <div className="w-64 bg-[#f8f9fa] border-r border-[#dadce0] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-[#dadce0]">
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-[#5f6368]" />
                <h1 className="text-lg font-normal text-[#3c4043]">Settings</h1>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex-1 overflow-auto p-2">
              <div className="space-y-1">
                {sidebarSections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => setSelectedSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        selectedSection === section.id 
                          ? 'bg-[#e8f0fe] text-[#1a73e8]' 
                          : 'text-[#3c4043] hover:bg-[#f1f3f4]'
                      }`}
                    >
                      <section.icon className="w-4 h-4" />
                      <span className="text-sm">{section.label}</span>
                    </button>
                    
                    {section.subsections && selectedSection === section.id && (
                      <div className="ml-7 mt-1 space-y-1">
                        {section.subsections.map((subsection) => (
                          <button
                            key={subsection.id}
                            className="w-full text-left px-3 py-1 text-sm text-[#5f6368] hover:bg-[#f1f3f4] rounded"
                          >
                            {subsection.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#dadce0]">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-normal text-[#3c4043]">
                  {sidebarSections.find(s => s.id === selectedSection)?.label || 'Settings'}
                </h1>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose} 
                className="h-8 w-8 p-0 text-[#5f6368] hover:bg-[#f1f3f4]"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              {renderContent()}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 