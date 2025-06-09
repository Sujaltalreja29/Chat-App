import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Shield, Calendar, CheckCircle, Edit3, Save, X } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(authUser?.fullName || "");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      try {
        await updateProfile({ profilePic: base64Image });
        toast.success("Profile picture updated successfully!");
      } catch (error) {
        toast.error("Failed to update profile picture");
        setSelectedImg(null);
      }
    };
  };

  const handleNameUpdate = async () => {
    if (!editedName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      await updateProfile({ fullName: editedName.trim() });
      setIsEditing(false);
      toast.success("Name updated successfully!");
    } catch (error) {
      toast.error("Failed to update name");
      setEditedName(authUser?.fullName || "");
    }
  };

  const cancelEdit = () => {
    setEditedName(authUser?.fullName || "");
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-base-200 pt-16">
      <div className="max-w-4xl mx-auto p-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">My Profile</h1>
          <p className="text-base-content/70">Manage your account settings and preferences</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body">
                
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group">
                    <img
                      src={selectedImg || authUser?.profilePic || "/avatar.png"}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-base-300 shadow-lg"
                    />
                    
                    {/* Camera Overlay */}
                    <label
                      htmlFor="avatar-upload"
                      className={`absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                        isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                      }`}
                    >
                      <Camera className="w-8 h-8 text-white" />
                      <input
                        type="file"
                        id="avatar-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUpdatingProfile}
                      />
                    </label>

                    {/* Upload Button */}
                    <label
                      htmlFor="avatar-upload"
                      className={`absolute -bottom-2 -right-2 btn btn-primary btn-circle btn-sm cursor-pointer shadow-lg ${
                        isUpdatingProfile ? "loading" : ""
                      }`}
                    >
                      <Camera className="w-4 h-4" />
                    </label>
                  </div>

                  <p className="text-sm text-base-content/60 mt-3 text-center">
                    {isUpdatingProfile ? (
                      <span className="flex items-center gap-2">
                        <span className="loading loading-spinner loading-xs"></span>
                        Uploading...
                      </span>
                    ) : (
                      "Click the camera icon to update your photo"
                    )}
                  </p>
                </div>

                {/* Profile Information */}
                <div className="space-y-6">
                  
                  {/* Full Name */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Full Name
                      </span>
                    </label>
                    
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="input input-bordered flex-1"
                          placeholder="Enter your full name"
                        />
                        <button onClick={handleNameUpdate} className="btn btn-success btn-square">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={cancelEdit} className="btn btn-error btn-square">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between input input-bordered">
                        <span className="text-base-content font-medium">
                          {authUser?.fullName}
                        </span>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="btn btn-ghost btn-sm btn-square"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </span>
                    </label>
                    <div className="input input-bordered flex items-center">
                      <span className="text-base-content">{authUser?.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Account Status */}
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body">
                <h3 className="card-title text-base-content mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Account Status
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base-content/70">Status</span>
                    <div className="badge badge-success gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-base-content/70">Verification</span>
                    <div className="badge badge-success gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body">
                <h3 className="card-title text-base-content mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Account Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-base-content/70">Member Since</span>
                    <p className="text-base-content font-medium">
                      {authUser?.createdAt ? formatDate(authUser.createdAt) : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-base-content/70">Account ID</span>
                    <p className="text-base-content font-mono text-sm">
                      {authUser?._id?.slice(-8).toUpperCase() || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

                        {/* Quick Actions */}
            <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-base-content mb-4">Quick Actions</h3>
                
                <div className="space-y-2">
                  <button className="btn btn-ghost w-full justify-start">
                    Privacy Settings
                  </button>
                  <button className="btn btn-ghost w-full justify-start">
                    Notification Preferences
                  </button>
                  <button className="btn btn-ghost w-full justify-start">
                    Download Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;