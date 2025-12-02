'use client';
import { useState } from 'react';
import { useSearchMembers } from '@/hooks/useMembers';
import { Member } from '@/lib/tcn-api-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Users } from 'lucide-react';

interface MemberSearchProps {
  selectedMembers: Member[];
  onMemberSelect: (member: Member) => void;
  onMemberRemove: (memberId: string) => void;
  onClearAll: () => void;
}

export default function MemberSearch({
  selectedMembers,
  onMemberSelect,
  onMemberRemove,
  onClearAll
}: MemberSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: searchResponse, isLoading, error } = useSearchMembers(searchTerm);
  const searchResults = searchResponse?.success ? searchResponse.data || [] : [];
  const hasError = error || (searchResponse && !searchResponse.success);
  const isUsingFallback = (searchResponse as any)?.meta?.fallback === 'mock_data';

  const isSelected = (memberId: string) => 
    selectedMembers.some(m => m.id === memberId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Select Members</h3>
        {selectedMembers.length > 0 && (
          <Button 
            onClick={onClearAll}
            variant="outline" 
            size="sm"
            className="text-red-600"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search members by name or T-number..."
          className="pl-10"
        />
      </div>

      {/* Selected Members */}
      {selectedMembers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Selected ({selectedMembers.length})
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {selectedMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded text-sm"
              >
                <div>
                  <span className="font-medium">
                    {member.personal_info.first_name} {member.personal_info.last_name}
                  </span>
                  <span className="text-gray-600 ml-2">
                    T#{member.personal_info.t_number}
                  </span>
                  {member.contact_number && (
                    <span className="text-gray-500 ml-2">
                      {member.contact_number}
                    </span>
                  )}
                </div>
                <Button
                  onClick={() => onMemberRemove(member.id)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchTerm && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Search Results
            {isLoading && <span className="text-blue-500"> (searching - may take up to 15 seconds...)</span>}
          </h4>
          
          {isUsingFallback && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-600">⚠️</span>
                <div>
                  <p className="font-medium">Using Sample Data</p>
                  <p className="text-xs">Member database server not responding - showing sample results for testing</p>
                </div>
              </div>
            </div>
          )}
          
          {hasError && searchTerm.length > 2 && !isLoading && (
            <div className="text-sm text-red-600 py-2 bg-red-50 border border-red-200 rounded p-2">
              <p className="font-medium">Search Error</p>
              <p className="text-xs mt-1">
                {error?.message || searchResponse?.error || 'Unable to search members. The database may be slow or unavailable.'}
              </p>
            </div>
          )}
          
          {!hasError && searchResults.length === 0 && searchTerm.length > 2 && !isLoading && (
            <div className="text-sm text-gray-500 py-2">
              <p>No members found matching "{searchTerm}"</p>
              <p className="text-xs mt-1">
                Try a more specific search or check the spelling.
              </p>
            </div>
          )}
          
          <div className="max-h-48 overflow-y-auto space-y-1">
            {searchResults.map((member) => (
              <div
                key={member.id}
                className={`flex items-center justify-between p-2 border rounded text-sm cursor-pointer transition-colors ${
                  isSelected(member.id)
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => !isSelected(member.id) && onMemberSelect(member)}
              >
                <div>
                  <span className="font-medium">
                    {member.personal_info.first_name} {member.personal_info.last_name}
                  </span>
                  <span className="text-gray-600 ml-2">
                    T#{member.personal_info.t_number}
                  </span>
                  <span className="text-gray-500 ml-2">
                    {member.contact_info.community}
                  </span>
                  {member.contact_number && (
                    <span className="text-gray-500 ml-2">
                      📱 {member.contact_number}
                    </span>
                  )}
                </div>
                {isSelected(member.id) && (
                  <Badge variant="secondary" className="text-green-700">
                    Selected
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <Users className="h-3 w-3" />
        {searchTerm ? `${searchResults.length} found` : 'Start typing to search members'}
      </div>
    </div>
  );
}