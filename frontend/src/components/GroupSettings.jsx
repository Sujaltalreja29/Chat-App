// components/GroupSettings.jsx
import { useState, useEffect } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { 
  X, Settings, Camera, Save, Shield, Users, 
  Hash, Edit3, Loader, AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";

const GroupSettings = ({ group, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: false,
    allowMemberInvite: true,
    maxMembers: 100
  });
  const [groupPicFile, setGroupPicFile] = useState(null);
  const [groupPicPreview, setGroupPicPreview] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const { authUser } = useAuthStore();
  const { 
    updateGroup, isUpdatingGroup, 
    getGroupDetails, currentGroup 
  } = useGroupStore();

  const groupData = currentGroup || group;

  useEffect(() => {
    if (isOpen && groupData) {
      // Initialize form with current group data
      setFormData({
        name: groupData.name || "",
        description: groupData.description || "",
        isPrivate: groupData.settings?.isPrivate || false,
        allowMemberInvite: groupData.settings?.allowMemberInvite !== false,
        maxMembers: groupData.settings?.maxMembers || 100
      });
      setGroupPicPreview(groupData.groupPic || null);
      setGroupPicFile(null);
      setHasChanges(false);
    }
  }, [isOpen, groupData]);

  if (!isOpen || !groupData) return null;

  const userMember = groupData.members?.find(
    member => member.user._id === authUser._id
  );
  const isAdmin = userMember?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-bold text-base-content mb-2">
            Access Denied
          </h3>
          <p className="text-base-content/70 mb-4">
            Only group admins can access group settings.
          </p>
          <button onClick={onClose} className="btn btn-primary">
            OK
          </button>
        </div>
      </div>
    );
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Image size should be less than 5MB");
      return;
    }

    setGroupPicFile(file);
    setHasChanges(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setGroupPicPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Group name is required");
      return;
    }

    if (formData.maxMembers < groupData.members?.length) {
      toast.error(`Maximum members cannot be less than current member count (${groupData.members?.length})`);
      return;
    }

    try {
      const updateData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim()
      };

      if (groupPicFile) {
        updateData.groupPic = groupPicFile;
      }

      await updateGroup(groupData._id, updateData);
      setHasChanges(false);
      onClose();
        } catch (error) {
      // Error handled in store
    }
  };

  const handleReset = () => {
    setFormData({
      name: groupData.name || "",
      description: groupData.description || "",
      isPrivate: groupData.settings?.isPrivate || false,
      allowMemberInvite: groupData.settings?.allowMemberInvite !== false,
      maxMembers: groupData.settings?.maxMembers || 100
    });
    setGroupPicPreview(groupData.groupPic || null);
    setGroupPicFile(null);
    setHasChanges(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Group Settings
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          
          {/* Group Picture Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-base-200 border-4 border-base-300 overflow-hidden shadow-lg">
                {groupPicPreview ? (
                  <img
                    src={groupPicPreview}
                    alt="Group preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Hash className="w-8 h-8 text-base-content/50" />
                  </div>
                )}
              </div>
              
              <label
                htmlFor="groupPicInput"
                className="absolute -bottom-2 -right-2 btn btn-primary btn-sm btn-circle cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  id="groupPicInput"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <p className="text-sm text-base-content/70 mt-2">
              Click the camera icon to change group photo
            </p>
          </div>

          {/* Basic Information */}
          <div className="space-y-6 mb-8">
            <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              Basic Information
            </h3>

            {/* Group Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Group Name *</span>
                <span className="label-text-alt text-base-content/60">
                  {formData.name.length}/50
                </span>
              </label>
              <input
                type="text"
                placeholder="Enter group name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input input-bordered w-full"
                maxLength={50}
                required
              />
            </div>

            {/* Description */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Description</span>
                <span className="label-text-alt text-base-content/60">
                  {formData.description.length}/200
                </span>
              </label>
              <textarea
                placeholder="What's this group about?"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="textarea textarea-bordered w-full resize-none"
                rows={3}
                maxLength={200}
              />
            </div>
          </div>

          {/* Privacy & Permissions */}
          <div className="space-y-6 mb-8">
            <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Privacy & Permissions
            </h3>

            {/* Private Group Toggle */}
            <div className="form-control">
              <label className="label cursor-pointer">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-base-content/70" />
                  <div>
                    <span className="label-text font-semibold">Private Group</span>
                    <div className="text-sm text-base-content/60">
                      Private groups won't appear in search results
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                  className="toggle toggle-primary"
                />
              </label>
            </div>

            {/* Member Invite Permission */}
            <div className="form-control">
              <label className="label cursor-pointer">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-base-content/70" />
                  <div>
                    <span className="label-text font-semibold">Allow member invites</span>
                    <div className="text-sm text-base-content/60">
                      Let group members add new people
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.allowMemberInvite}
                  onChange={(e) => handleInputChange('allowMemberInvite', e.target.checked)}
                  className="toggle toggle-primary"
                />
              </label>
            </div>

            {/* Maximum Members */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Maximum Members</span>
                <span className="label-text-alt text-base-content/60">
                  Current: {groupData.members?.length || 0}
                </span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={groupData.members?.length || 1}
                  max="500"
                  value={formData.maxMembers}
                  onChange={(e) => handleInputChange('maxMembers', parseInt(e.target.value))}
                  className="range range-primary flex-1"
                />
                <div className="badge badge-primary min-w-[60px]">
                  {formData.maxMembers}
                </div>
              </div>
              <div className="flex justify-between text-xs text-base-content/60 mt-1">
                <span>{groupData.members?.length || 0}</span>
                <span>500</span>
              </div>
            </div>
          </div>

          {/* Group Statistics */}
          <div className="bg-base-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-base-content mb-3">Group Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-base-content/70">Total Members:</span>
                <div className="font-semibold text-base-content">
                  {groupData.members?.length || 0}
                </div>
              </div>
              <div>
                <span className="text-base-content/70">Created:</span>
                <div className="font-semibold text-base-content">
                  {new Date(groupData.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="text-base-content/70">Group Type:</span>
                <div className="font-semibold text-base-content">
                  {groupData.settings?.isPrivate ? 'Private' : 'Public'}
                </div>
              </div>
              <div>
                <span className="text-base-content/70">Your Role:</span>
                <div className="font-semibold text-base-content capitalize">
                  {userMember?.role}
                  {groupData._id === authUser._id && ' (Creator)'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-base-300">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
              disabled={isUpdatingGroup}
            >
              Cancel
            </button>
            
            {hasChanges && (
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-outline"
                disabled={isUpdatingGroup}
              >
                Reset
              </button>
            )}
            
            <button
              type="submit"
              disabled={isUpdatingGroup || !hasChanges || !formData.name.trim()}
              className="btn btn-primary flex-1"
            >
              {isUpdatingGroup ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupSettings;