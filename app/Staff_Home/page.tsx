"use client"

import SessionBar from '@/components/SessionBar'
import BulletinCreator from '@/components/BulletinCreator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MessageSquare, Megaphone } from "lucide-react"
import { useState } from "react"

export default function StaffHomePage() {
  const [activeTab, setActiveTab] = useState("sms")

  const menuItems = [
    { id: "sms", label: "SMS", icon: MessageSquare, description: "Send text messages" },
    { id: "email", label: "Email", icon: Mail, description: "Send emails" },
    { id: "bulletin", label: "Bulletin", icon: Megaphone, description: "Post bulletins" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <SessionBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className='grid grid-cols-1 lg:grid-cols-7 gap-6'>
          {/* Side Menu */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <CardTitle>Communications</CardTitle>
                <CardDescription>Select a channel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">{item.label}</div>
                        <div className={`text-xs ${activeTab === item.id ? 'text-blue-100' : 'text-gray-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Communication Channel Tabs */}
          <div className='lg:col-span-5'>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sms">SMS</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="bulletin">Bulletin</TabsTrigger>
              </TabsList>

              <TabsContent value="sms">
                <Card>
                  <CardHeader>
                    <CardTitle>Send SMS</CardTitle>
                    <CardDescription>Send text messages to members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">SMS form content goes here</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <CardTitle>Send Email</CardTitle>
                    <CardDescription>Send emails to members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">Email form content goes here</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bulletin">
                <BulletinCreator />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
