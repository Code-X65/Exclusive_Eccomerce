import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Camera, Shield, User2 } from 'lucide-react';
import { useAuth } from '../Components/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../Components/firebase';
import { toast } from 'react-toastify';
const Profile = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveOrderHistory, setSaveOrderHistory] = useState(true);
const [productRecommendations, setProductRecommendations] = useState(true);
  //  profile states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  

  // Profile picture state
  // const [profileImage, setProfileImage] = useState(userName.currentUser.photoURL);
  
// Fetch user profile from database
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userId) {
        console.warn('No userId provided');
        return;
      }

      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Set profile data with fallbacks to Google profile
        setFirstName(userData.firstName || currentUser.displayName?.split(' ')[0] || '');
        setLastName(userData.lastName || currentUser.displayName?.split(' ').slice(1).join(' ') || '');
        setEmail(userData.email || currentUser.email || '');
        setPhone(userData.phone || '');
        setBirthdate(userData.birthdate || '');
        setProfileImage(userData.profileImage || currentUser.photoURL || '');
        
        // Set preferences
        const prefs = userData.preferences || {};
        setNewsletterSubscribed(prefs.newsletterSubscribed ?? true);
        setSmsNotifications(prefs.smsNotifications ?? false);
        setSaveOrderHistory(prefs.saveOrderHistory ?? true);  // ADD THIS
setProductRecommendations(prefs.productRecommendations ?? true);  // ADD THIS
      } else {
        // Use Google profile data as defaults
        setFirstName(currentUser.displayName?.split(' ')[0] || '');
        setLastName(currentUser.displayName?.split(' ').slice(1).join(' ') || '');
        setEmail(currentUser.email || '');
        setProfileImage(currentUser.photoURL || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  // Handleing ######
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      if (!userId) {
        throw new Error('User authentication required');
      }

      const userDocRef = doc(db, 'users', userId);
      const profileData = {
        firstName,
        lastName,
        email,
        phone,
        birthdate,
        profileImage,
        preferences: {
        newsletterSubscribed,
    smsNotifications,
    saveOrderHistory,        // ADD THIS
    productRecommendations   // ADD THIS
        },
        updatedAt: new Date()
      };

      await setDoc(userDocRef, profileData, { merge: true });

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
    }
  };

const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const imageUrl = URL.createObjectURL(e.target.files[0]);
      setProfileImage(imageUrl);
      // Note: For production, upload to Firebase Storage and save URL
    }
  };


  // Effects ######################
useEffect(() => {
  if (userId) {
    fetchProfile();
  } else {
    setLoading(false);
  }
}, [userId]);

  if (!currentUser) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto flex justify-center items-center py-8">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  
  return (
    <>

    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">My Profile</h2>
        <span className="text-sm text-gray-500">
  Account created on {new Date(currentUser?.metadata?.creationTime).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}
</span>
      </div>
      
      {/* Profile Header with Image */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-gray-400" />
              )}
            </div>
            <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-gray-300 cursor-pointer shadow-sm hover:bg-gray-50">
              <Camera size={16} className="text-gray-600" />
              <input 
                type="file" 
                id="profile-image" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
          
          <div className="text-center md:text-left">
           <h3 className="text-lg font-medium">{firstName} {lastName}</h3>
            <div className="flex items-center justify-center md:justify-start text-gray-600 text-sm mt-1">
              <Mail size={14} className="mr-1" />
              <span>{email}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start text-gray-600 text-sm mt-1">
              <User2 size={14} className="mr-1" />
              <span>{currentUser.metadata.creationTime}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Loyal Member</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">5 Orders</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-3 px-1 border-b-2 text-sm font-medium ${
              activeTab === 'personal'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-3 px-1 border-b-2 text-sm font-medium ${
              activeTab === 'preferences'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Preferences
          </button>
        </nav>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 text-sm underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}
      <form onSubmit={handleSaveChanges}>
        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-10 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="pl-10 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      className="pl-10 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                    />
                  </div>
                </div>
             
              </div>
            </div>
          </div>
        )}
        
      
        
        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Communication Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="newsletter"
                      name="newsletter"
                      type="checkbox"
                      checked={newsletterSubscribed}
                      onChange={(e) => setNewsletterSubscribed(e.target.checked)}
                      className="h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="newsletter" className="font-medium text-gray-700">Newsletter</label>
                    <p className="text-gray-500">Receive updates about new products, sales, and promotions.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="sms"
                      name="sms"
                      type="checkbox"
                      checked={smsNotifications}
                      onChange={(e) => setSmsNotifications(e.target.checked)}
                      className="h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="sms" className="font-medium text-gray-700">SMS Notifications</label>
                    <p className="text-gray-500">Receive text messages about order updates and special offers.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Account Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="order-history"
                      name="order-history"
                      type="checkbox"
                      defaultChecked={true}
                      className="h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                    <input
  id="order-history"
  name="order-history"
  type="checkbox"
  checked={saveOrderHistory}
  onChange={(e) => setSaveOrderHistory(e.target.checked)}
  className="h-4 w-4 text-red-600 border-gray-300 rounded"
/>

<input
  id="browsing-history"
  name="browsing-history"
  type="checkbox"
  checked={productRecommendations}
  onChange={(e) => setProductRecommendations(e.target.checked)}
  className="h-4 w-4 text-red-600 border-gray-300 rounded"
/>
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="order-history" className="font-medium text-gray-700">Save Order History</label>
                    <p className="text-gray-500">Allow us to store your order history for easier reordering.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="browsing-history"
                      name="browsing-history"
                      type="checkbox"
                      defaultChecked={true}
                      className="h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="browsing-history" className="font-medium text-gray-700">Product Recommendations</label>
                    <p className="text-gray-500">Allow personalized product recommendations based on your browsing history.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Save/Cancel Buttons */}
        <div className="mt-8 flex justify-end gap-3">
          <button 
            type="button" 
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium transition duration-150"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium transition duration-150"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
    </>
  );
};

export default Profile;