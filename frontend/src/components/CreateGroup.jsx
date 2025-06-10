// components/CreateGroup.jsx
import { useState } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useFriendStore } from "../store/useFriendStore";
import { X, Users, Camera, Plus, Check } from "lucide-react";
import { useEffect } from "react";

const CreateGroup = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: false,
    allowMemberInvite: true,
    groupPic: null
  });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupPicPreview, setGroupPicPreview] = useState(null);

  const { createGroup, isCreatingGroup } = useGroupStore();
  const { friends, getFriends } = useFriendStore();

  useEffect(() => {
    if (isOpen) {
      getFriends();
    }
  }, [isOpen, getFriends]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setFormData({ ...formData, groupPic: file });
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setGroupPicPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const toggleMemberSelection = (friendId) => {
    setSelectedMembers(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Group name is required");
      return;
    }

    try {
      await createGroup({
        ...formData,
        memberIds: selectedMembers
      });
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        isPrivate: false,
        allowMemberInvite: true,
        groupPic: null
      });
      setSelectedMembers([]);
      setGroupPicPreview(null);
      onClose();
    } catch (error) {
      // Error handled in store
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Create New Group
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Group Picture */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-base-200 border-2 border-base-300 flex items-center justify-center overflow-hidden">
                  {groupPicPreview ? (
                    <img
                      src={groupPicPreview}
                      alt="Group preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="w-8 h-8 text-base-content/50" />
                  )}
                </div>
                <label
                  htmlFor="groupPic"
                  className="absolute -bottom-1 -right-1 btn btn-primary btn-sm btn-circle cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    id="groupPic"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <p className="text-sm text-base-content/70">Add a group photo</p>
            </div>

            {/* Group Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Group Name *</span>
              </label>
              <input
                type="text"
                placeholder="Enter group name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input input-bordered w-full"
                maxLength={50}
                required
              />
            </div>

            {/* Description */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Description</span>
              </label>
              <textarea
                placeholder="What's this group about?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="textarea textarea-bordered w-full resize-none"
                rows={3}
                maxLength={200}
              />
            </div>

            {/* Group Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base-content">Group Settings</h3>
              
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Private Group</span>
                  <input
                    type="checkbox"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                    className="toggle toggle-primary"
                  />
                </label>
                                <div className="label">
                  <span className="label-text-alt text-base-content/60">
                    Private groups won't appear in search results
                  </span>
                </div>
              </div>
              
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Allow members to invite others</span>
                  <input
                    type="checkbox"
                    checked={formData.allowMemberInvite}
                    onChange={(e) => setFormData({ ...formData, allowMemberInvite: e.target.checked })}
                    className="toggle toggle-primary"
                  />
                </label>
                <div className="label">
                  <span className="label-text-alt text-base-content/60">
                    Let group members add new people
                  </span>
                </div>
              </div>
            </div>

            {/* Add Members */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base-content">Add Friends</h3>
                <div className="badge badge-primary">
                  {selectedMembers.length} selected
                </div>
              </div>

              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-base-content/30 mx-auto mb-2" />
                  <p className="text-base-content/70">No friends to add</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {friends.map((friend) => (
                    <div
                      key={friend._id}
                      onClick={() => toggleMemberSelection(friend._id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedMembers.includes(friend._id)
                          ? 'bg-primary/20 border border-primary'
                          : 'bg-base-200 hover:bg-base-300'
                      }`}
                    >
                      {/* Avatar */}
                      <img
                        src={friend.profilePic || "/avatar.png"}
                        alt={friend.fullName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-base-300"
                      />

                      {/* Friend Info */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-base-content">
                          {friend.fullName}
                        </h4>
                        <p className="text-sm text-base-content/70">
                          {friend.email}
                        </p>
                      </div>

                      {/* Selection Indicator */}
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedMembers.includes(friend._id)
                          ? 'bg-primary border-primary text-primary-content'
                          : 'border-base-300'
                      }`}>
                        {selectedMembers.includes(friend._id) && (
                          <Check className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost flex-1"
                disabled={isCreatingGroup}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingGroup || !formData.name.trim()}
                className="btn btn-primary flex-1"
              >
                {isCreatingGroup ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Group
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;