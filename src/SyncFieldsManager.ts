import React, { useState, useEffect } from 'react';
import { Template, checkTemplate } from '@pdfme/common';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SyncFieldsProps {
  designer: React.MutableRefObject<any>;
  onTemplateChange?: (template: Template) => void;
}

interface SyncGroup {
  baseField: string;
  fields: string[];
  mainField: string;
  currentValue: string;
}

const SyncFieldsManager: React.FC<SyncFieldsProps> = ({ designer, onTemplateChange }) => {
  const [syncGroups, setSyncGroups] = useState<SyncGroup[]>([]);

  // Initialize sync groups whenever designer template changes
  useEffect(() => {
    if (!designer.current) return;

    const detectSyncGroups = () => {
      const template = designer.current.getTemplate();
      const schemas = template.schemas[0];
      const groups: Record<string, string[]> = {};

      // Find fields that follow the sync naming pattern (e.g., projectTitle1, projectTitle2)
      Object.entries(schemas).forEach(([key, value]: [string, any]) => {
        if (value.type === 'text' || value.type === 'multiVariableText') {
          const baseNameMatch = key.match(/^([a-zA-Z]+)(\d+)$/);
          if (baseNameMatch) {
            const baseName = baseNameMatch[1];
            if (!groups[baseName]) {
              groups[baseName] = [];
            }
            groups[baseName].push(key);
          }
        }
      });

      // Convert to SyncGroup array
      const syncGroupsArray = Object.entries(groups)
        .filter(([_, fields]) => fields.length > 1)
        .map(([baseName, fields]) => {
          const mainField = fields.find(f => f.endsWith('1')) || fields[0];
          return {
            baseField: baseName,
            fields,
            mainField,
            currentValue: schemas[mainField].content || ''
          };
        });

      setSyncGroups(syncGroupsArray);
    };

    // Listen for template changes
    const handleTemplateChange = () => {
      detectSyncGroups();
    };

    designer.current.onChangeTemplate(handleTemplateChange);
    detectSyncGroups();

    return () => {
      // Cleanup if needed
      if (designer.current) {
        designer.current.removeEventListener('changeTemplate', handleTemplateChange);
      }
    };
  }, [designer]);

  const updateSyncedFields = (baseField: string, newValue: string) => {
    if (!designer.current) return;

    const template = designer.current.getTemplate();
    const group = syncGroups.find(g => g.baseField === baseField);
    
    if (!group) return;

    const newTemplate = {
      ...template,
      schemas: [
        {
          ...template.schemas[0],
          ...group.fields.reduce((acc, fieldKey) => ({
            ...acc,
            [fieldKey]: {
              ...template.schemas[0][fieldKey],
              content: newValue
            }
          }), {})
        }
      ]
    };

    try {
      checkTemplate(newTemplate);
      designer.current.updateTemplate(newTemplate);
      
      // Update sync groups with new value
      setSyncGroups(prev => 
        prev.map(g => 
          g.baseField === baseField 
            ? { ...g, currentValue: newValue }
            : g
        )
      );

      // Notify parent of template change if callback provided
      if (onTemplateChange) {
        onTemplateChange(newTemplate);
      }

    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };

  if (syncGroups.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Synchronized Fields</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {syncGroups.map(group => (
            <div key={group.baseField} className="grid gap-2">
              <Label htmlFor={group.baseField}>
                {group.baseField.replace(/([A-Z])/g, ' $1').trim()}
              </Label>
              <Input
                id={group.baseField}
                value={group.currentValue}
                onChange={(e) => updateSyncedFields(group.baseField, e.target.value)}
                placeholder={`Enter ${group.baseField.toLowerCase()}`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncFieldsManager;