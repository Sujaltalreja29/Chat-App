// pages/ProfilePage.jsx - Clean & Responsive
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
        toast.success("Profile picture updated!");
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
      toast.success("Name updated!");
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
  console.log("authUser", authUser);

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* Compact Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-4 md:p-6">
                
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group">
                    <img
                      src={"/avatar.png"}
                      alt="Profile"
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-base-300"
                    />
                    
                    {/* Camera Overlay */}
                    <label
                      htmlFor="avatar-upload"
                      className={`absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                        isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                      }`}
                    >
                      <Camera className="w-6 h-6 text-white" />
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
                      className={`absolute -bottom-1 -right-1 btn btn-primary btn-circle btn-sm cursor-pointer ${
                        isUpdatingProfile ? "loading" : ""
                      }`}
                    >
                      {!isUpdatingProfile && <Camera className="w-4 h-4" />}
                    </label>
                  </div>

                  {isUpdatingProfile && (
                    <p className="text-sm text-base-content/60 mt-2 flex items-center gap-2">
                      <span className="loading loading-spinner loading-xs"></span>
                      Uploading...
                    </p>
                  )}
                </div>

                {/* Profile Information */}
                <div className="space-y-4">
                  
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
                        <button onClick={handleNameUpdate} className="btn btn-success btn-sm">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={cancelEdit} className="btn btn-error btn-sm">
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
          <div className="space-y-4">
            
            {/* Account Status */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Account Status
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/70">Status</span>
                    <div className="badge badge-success badge-sm gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/70">Verified</span>
                    <div className="badge badge-success badge-sm gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Yes
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Account Details
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-base-content/70">Member Since</span>
                    <p className="text-sm font-medium">
                      {authUser?.createdAt ? formatDate(authUser.createdAt) : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-base-content/70">Account ID</span>
                    <p className="text-xs font-mono">
                      {authUser?._id?.slice(-8).toUpperCase() || 'N/A'}
                    </p>
                  </div>
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