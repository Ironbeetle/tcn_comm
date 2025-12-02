"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { searchMembers } from "@/lib/actions";
import { FnMemberSchema } from "@/lib/validation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { z } from "zod";
import { toast } from "sonner";

type Member = z.infer<typeof FnMemberSchema>;

interface AppMessage {
    id?: string;
    title: string;
    content: string;
    priority: 'low' | 'medium' | 'high';
    expiryDate?: string;
    date?: string;
    time?: string;
    location?: string;
    type: 'job' | 'notice' | 'event';
    isPublished: boolean;
}

// SMS Composer Component
const SMSComposer = ({ selectedRecipients, handleRemoveMember }: { 
    selectedRecipients: Member[], 
    handleRemoveMember: (memberId: string) => void 
}) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newMessage = e.target.value;
        if (newMessage.length <= 160) {
            setMessage(newMessage);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        try {
            const formData = new FormData();
            formData.append('type', 'sms');
            formData.append('message', message);
            formData.append('recipients', JSON.stringify(selectedRecipients));

            const response = await fetch('/api/messages', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message');
            }

            toast.success(`SMS sent successfully to ${selectedRecipients.length} recipients`);
            setMessage('');
            selectedRecipients.forEach(r => handleRemoveMember(r.t_number));

        } catch (error: any) {
            toast.error(error.message || 'Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="w-full p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Recipients ({selectedRecipients.length})
                    </label>
                    <div className="bg-gray-700 border border-gray-600 rounded-md p-2 max-h-32 overflow-y-auto">
                        {selectedRecipients.length === 0 ? (
                            <p className="text-gray-400 text-sm">No recipients selected</p>
                        ) : (
                            selectedRecipients.map((member) => (
                                <div key={member.t_number} className="flex items-center justify-between p-1 hover:bg-gray-600 rounded">
                                    <span className="text-sm text-white">
                                        {member.first_name} {member.last_name} - {member.contact_number}
                                    </span>
                                    <Button
                                        onClick={() => handleRemoveMember(member.t_number)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        ✕
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Message
                    </label>
                    <textarea
                        value={message}
                        onChange={handleMessageChange}
                        rows={4}
                        className={`w-full rounded-md bg-gray-700 border ${
                            message.length === 160 ? 'border-yellow-500' : 'border-gray-600'
                        } p-2 text-white placeholder-gray-400`}
                        placeholder="Type your SMS message here..."
                        maxLength={160}
                    />
                    <div className={`text-right text-sm ${
                        message.length === 160 ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                        {message.length}/160 characters
                    </div>
                </div>

                <div className="flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        type="button"
                        disabled={isSending}
                        onClick={() => {
                            setMessage('');
                            selectedRecipients.forEach(r => handleRemoveMember(r.t_number));
                        }}
                    >
                        Clear
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSending || !message.trim() || selectedRecipients.length === 0}
                    >
                        {isSending ? 'Sending...' : 'Send SMS'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

// Email Composer Component
const EmailComposer = ({ selectedRecipients, handleRemoveMember }: { 
    selectedRecipients: Member[], 
    handleRemoveMember: (memberId: string | string[]) => void 
}) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isSending, setIsSending] = useState(false);

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAttachments(prev => [...prev, ...files]);
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        try {
            const formData = new FormData();
            formData.append('type', 'email');
            formData.append('subject', subject);
            formData.append('message', message);
            formData.append('recipients', JSON.stringify(selectedRecipients));
            
            attachments.forEach(file => {
                formData.append('attachments', file);
            });

            const response = await fetch('/api/messages', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send email');
            }

            toast.success(`Email sent successfully to ${selectedRecipients.length} recipients`);
            setSubject('');
            setMessage('');
            handleRemoveMember(selectedRecipients.map(r => r.t_number));
            setAttachments([]);

        } catch (error: any) {
            toast.error(error.message || 'Failed to send email');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="w-full p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Recipients ({selectedRecipients.length})
                    </label>
                    <div className="bg-gray-700 border border-gray-600 rounded-md p-2 max-h-32 overflow-y-auto">
                        {selectedRecipients.length === 0 ? (
                            <p className="text-gray-400 text-sm">No recipients selected</p>
                        ) : (
                            selectedRecipients.map((member) => (
                                <div key={member.t_number} className="flex items-center justify-between p-1 hover:bg-gray-600 rounded">
                                    <span className="text-sm text-white">
                                        {member.first_name} {member.last_name} - {member.email || 'No email'}
                                    </span>
                                    <Button
                                        onClick={() => handleRemoveMember(member.t_number)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        ✕
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Subject
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-white placeholder-gray-400"
                        placeholder="Enter email subject..."
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Message
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-white placeholder-gray-400"
                        placeholder="Type your email message here..."
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Attachments
                    </label>
                    <input
                        type="file"
                        multiple
                        onChange={handleAttachmentChange}
                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                    <div className="mt-2 space-y-2">
                        {attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                                <span className="text-sm text-white truncate">{file.name}</span>
                                <Button
                                    onClick={() => removeAttachment(index)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:text-red-300"
                                >
                                    ✕
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        type="button"
                        disabled={isSending}
                        onClick={() => {
                            setSubject('');
                            setMessage('');
                            handleRemoveMember(selectedRecipients.map(r => r.t_number));
                            setAttachments([]);
                        }}
                    >
                        Clear
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSending || !subject.trim() || !message.trim() || selectedRecipients.length === 0}
                    >
                        {isSending ? 'Sending...' : 'Send Email'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

// Web API Message Composer Component
const WebAPIMessageComposer = () => {
    const [message, setMessage] = useState<AppMessage>({
        title: '',
        content: '',
        priority: 'low',
        type: 'notice',
        isPublished: false,
        date: '',
        time: '',
        location: ''
    });
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        try {
            const payload = {
                ...message,
                date: message.date ? new Date(message.date).toISOString() : undefined,
                time: message.time ? new Date(`1970-01-01T${message.time}:00`).toISOString() : undefined,
                expiryDate: message.expiryDate ? new Date(message.expiryDate).toISOString() : undefined,
            };

            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to publish message');
            }

            toast.success('Message published successfully');
            
            // Reset form
            setMessage({
                title: '',
                content: '',
                priority: 'low',
                type: 'notice',
                isPublished: false,
                date: '',
                time: '',
                location: ''
            });

        } catch (error: any) {
            toast.error(error.message || 'Failed to publish message');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="w-full p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Title
                    </label>
                    <input
                        type="text"
                        value={message.title}
                        onChange={(e) => setMessage({ ...message, title: e.target.value })}
                        className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-white placeholder-gray-400"
                        placeholder="Enter message title..."
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Content
                    </label>
                    <textarea
                        value={message.content}
                        onChange={(e) => setMessage({ ...message, content: e.target.value })}
                        className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-white placeholder-gray-400"
                        rows={4}
                        placeholder="Enter message content..."
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                            Priority
                        </label>
                        <select
                            value={message.priority}
                            onChange={(e) => setMessage({ ...message, priority: e.target.value as 'low' | 'medium' | 'high' })}
                            className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-white"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                            Message Type
                        </label>
                        <select
                            value={message.type}
                            onChange={(e) => setMessage({ ...message, type: e.target.value as 'job' | 'notice' | 'event' })}
                            className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-white"
                        >
                            <option value="job">Job</option>
                            <option value="notice">Notice</option>
                            <option value="event">Event</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Location
                    </label>
                    <input
                        type="text"
                        value={message.location || ''}
                        onChange={(e) => setMessage({ ...message, location: e.target.value })}
                        className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-white placeholder-gray-400"
                        placeholder="Enter event/job location..."
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                            Date
                        </label>
                        <input
                            type="date"
                            value={message.date || ''}
                            onChange={(e) => setMessage({ ...message, date: e.target.value })}
                            className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-white"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                            Time
                        </label>
                        <input
                            type="time"
                            value={message.time || ''}
                            onChange={(e) => setMessage({ ...message, time: e.target.value })}
                            className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-white"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Expiry Date (Optional)
                    </label>
                    <input
                        type="datetime-local"
                        value={message.expiryDate || ''}
                        onChange={(e) => setMessage({ ...message, expiryDate: e.target.value })}
                        className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-white"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="publish-immediately"
                        checked={message.isPublished}
                        onChange={(e) => setMessage({ ...message, isPublished: e.target.checked })}
                        className="rounded border-gray-600 bg-gray-700"
                    />
                    <label htmlFor="publish-immediately" className="text-sm text-gray-300">
                        Publish immediately
                    </label>
                </div>

                <div className="flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        type="button"
                        disabled={isSending}
                        onClick={() => {
                            setMessage({
                                title: '',
                                content: '',
                                priority: 'low',
                                type: 'notice',
                                isPublished: false,
                                date: '',
                                time: '',
                                location: ''
                            });
                        }}
                    >
                        Clear
                    </Button>
                    <Button
                        type="submit"
                        disabled={
                            isSending || 
                            !message.title.trim() || 
                            !message.content.trim() || 
                            !message.location?.trim() ||
                            !message.date ||
                            !message.time
                        }
                    >
                        {isSending ? 'Publishing...' : 'Publish Message'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

// Main Communications Component
export default function Communications() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState<Member[]>([]);

    const handleSelectMember = (member: any) => {
        // Normalize the member data to match FnMemberSchema
        const normalizedMember: Member = {
            id: member.id,
            created: member.created ? new Date(member.created) : new Date(),
            updated: member.updated ? new Date(member.updated) : new Date(),
            birthdate: member.birthdate ? new Date(member.birthdate) : new Date(),
            first_name: member.first_name,
            last_name: member.last_name,
            t_number: member.t_number,
            gender: member.gender || 'Not specified',
            o_r_status: member.o_r_status || 'onreserve',
            community: member.community || 'Unknown',
            contact_number: member.contact_number || '',
            option: member.option || 'none',
            email: member.email || undefined,
            dependents: member.dependents || 0,
            deceased: member.deceased || false,
        };

        if (!selectedRecipients.some(r => r.t_number === normalizedMember.t_number)) {
            setSelectedRecipients([...selectedRecipients, normalizedMember]);
        }
    };

    const handleRemoveMember = (memberId: string | string[]) => {
        if (Array.isArray(memberId)) {
            setSelectedRecipients(prev => 
                prev.filter(r => !memberId.includes(r.t_number))
            );
        } else {
            setSelectedRecipients(prev => 
                prev.filter(r => r.t_number !== memberId)
            );
        }
    };

    const { data: searchData, isLoading: isSearching, error: searchError } = useQuery({
        queryKey: ['memberSearch', searchTerm],
        queryFn: () => searchMembers(searchTerm),
        enabled: searchTerm.length > 2,
        staleTime: 30000,
    });

    return (
        <div className="flex h-full w-full bg-gray-800 rounded-lg">
            <div className="flex-1 p-6 h-auto overflow-y-auto">
                <Tabs defaultValue="sms" className="w-full">
                    <TabsList className="w-full justify-start gap-2 bg-gray-700 p-1">
                        <TabsTrigger 
                            value="sms" 
                            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-2xl"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="18" 
                                height="18" 
                                viewBox="0 0 26 26" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            SMS
                        </TabsTrigger>
                        <TabsTrigger 
                            value="email"
                            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-2xl"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            Email
                        </TabsTrigger>
                        <TabsTrigger 
                            value="webapi"
                            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-2xl"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                            </svg>
                            Web API Messages
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="sms" className="mt-4">
                        <SMSComposer 
                            selectedRecipients={selectedRecipients}
                            handleRemoveMember={handleRemoveMember}
                        />
                    </TabsContent>
                    <TabsContent value="email" className="mt-4">
                        <EmailComposer 
                            selectedRecipients={selectedRecipients}
                            handleRemoveMember={handleRemoveMember}
                        />
                    </TabsContent>
                    <TabsContent value="webapi" className="mt-4">
                        <WebAPIMessageComposer />
                    </TabsContent>
                </Tabs>
            </div>
            {/* Member Search Sidebar */}
            <div className="w-100 border-l border-gray-700 p-4 overflow-y-auto bg-gray-750">
                <div className="flex flex-col space-y-4">
                    <h2 className="text-xl font-bold text-white">First Nation Member Search</h2>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search members (min 3 chars)..."
                        className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400"
                    />
                    
                    {searchTerm.length > 0 && searchTerm.length < 3 && (
                        <div className="text-sm text-gray-400">
                            Type at least 3 characters to search
                        </div>
                    )}
                    
                    {isSearching && (
                        <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                            <span className="ml-2 text-gray-300">Searching...</span>
                        </div>
                    )}
                    
                    {searchError && (
                        <div className="text-red-400 text-sm">
                            Error searching: {searchError.message}
                        </div>
                    )}
                    
                    {searchData && searchData.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-300">
                                Found {searchData.length} member(s)
                            </h3>
                            {searchData.map((member) => (
                                <div
                                    key={member.t_number}
                                    className="flex items-center justify-between p-3 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
                                    onClick={() => handleSelectMember(member)}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">
                                            {member.first_name} {member.last_name}
                                        </span>
                                        <div className="text-xs text-gray-400 space-y-1">
                                            <div>📱 {member.contact_number || 'No phone'}</div>
                                            <div>📧 {member.email || 'No email'}</div>
                                            <div>🏘️ {member.community || 'Unknown community'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-mono text-gray-300">
                                            {member.t_number}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {member.o_r_status || 'onreserve'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {searchData && searchData.length === 0 && searchTerm.length >= 3 && !isSearching && (
                        <div className="text-gray-400 text-center py-4">
                            No members found matching "{searchTerm}"
                        </div>
                    )}
                    
                    {selectedRecipients.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-600">
                            <h3 className="font-medium mb-2 text-white">
                                Selected Recipients ({selectedRecipients.length})
                            </h3>
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                                {selectedRecipients.map((member) => (
                                    <div
                                        key={member.t_number}
                                        className="flex items-center justify-between text-sm bg-blue-900 p-2 rounded"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white">
                                                {member.first_name} {member.last_name}
                                            </span>
                                            <span className="text-xs text-blue-300">
                                                {member.t_number}
                                            </span>
                                        </div>
                                        <Button
                                            onClick={() => handleRemoveMember(member.t_number)}
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 hover:bg-red-600 text-red-400"
                                        >
                                            ✕
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                onClick={() => setSelectedRecipients([])}
                                variant="outline"
                                size="sm"
                                className="mt-2 w-full"
                            >
                                Clear All Recipients
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}