import { Mail, Phone, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import React, { useState, useEffect } from 'react'

const ContactPage = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
  const [statusMessage, setStatusMessage] = useState('');
  const [emailJSLoaded, setEmailJSLoaded] = useState(false);

  // Load EmailJS when component mounts
  useEffect(() => {
    const loadEmailJS = () => {
      if (window.emailjs) {
        setEmailJSLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      script.async = true;
      script.onload = () => {
        window.emailjs.init({
          publicKey: 'le_8hFfmXsk6tcrQf' // Replace with your EmailJS public key
        });
        setEmailJSLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load EmailJS');
        setEmailJSLoaded(false);
      };
      document.head.appendChild(script);
    };

    loadEmailJS();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Send email function
  const sendContactEmail = async (formData) => {
    try {
      if (!window.emailjs) {
        throw new Error('EmailJS not loaded. Please refresh and try again.');
      }

      const templateParams = {
        to_email: 'omoloyeamoss65@gmail.com', // Replace with your business email
        from_name: formData.name,
        from_email: formData.email,
        phone_number: formData.phone,
        message: formData.message,
        date_sent: new Date().toLocaleDateString(),
        time_sent: new Date().toLocaleTimeString(),
        // Add subject for easy identification
        subject: `New Contact Form Submission from ${formData.name}`,
        // Priority based on message length (longer messages might be more urgent)
        priority: formData.message.length > 200 ? 'HIGH' : 'NORMAL'
      };

      console.log('Sending contact form email...');

      const response = await window.emailjs.send(
        'service_g4g9dcl',    // Replace with your EmailJS service ID
        'template_6v0kkir',   // Replace with your contact form template ID
        templateParams
      );

      console.log('Contact form email sent successfully:', response);
      return { success: true, response };

    } catch (error) {
      console.error('Error sending contact form email:', error);
      return { success: false, error: error.message || 'Failed to send message' };
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setStatusMessage('');

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus('error');
      setStatusMessage('Please fill in all required fields (Name, Email, and Message)');
      setIsSubmitting(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus('error');
      setStatusMessage('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      // Send email
      const result = await sendContactEmail(formData);
      
      if (result.success) {
        setSubmitStatus('success');
        setStatusMessage('Thank you! Your message has been sent successfully. We will get back to you within 24 hours.');
        // Clear form
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
        setStatusMessage(`Failed to send message: ${result.error}. Please try again or contact us directly.`);
      }
    } catch (error) {
      setSubmitStatus('error');
      setStatusMessage('An unexpected error occurred. Please try again later.');
      console.error('Contact form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-dismiss status messages after 8 seconds
  useEffect(() => {
    if (submitStatus) {
      const timer = setTimeout(() => {
        setSubmitStatus(null);
        setStatusMessage('');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  return (
    <>
      <div className='max-w-6xl mx-auto py-6 md:py-8 lg:py-10 px-2'>
        <div className='flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10 items-center justify-center'>
          {/* Contact Info Card */}
          <div className='py-6 md:py-8 px-4 md:px-6 shadow-md font-[400] w-full max-w-[350px] lg:max-w-[270px] rounded-md bg-white'>
            {/* Phone Section */}
            <div className='flex flex-col gap-2 md:gap-3 text-xs pb-4 border-b border-gray-300'>
              <h1 className='font-semibold flex items-center gap-2 text-sm md:text-base'>
                <Phone size={24} className='text-white bg-red-600 p-1 rounded-full' /> 
                Call To US
              </h1>
              <p className='text-xs md:text-sm'>We are available 24/7, days a week</p>
              <p className='text-xs md:text-sm'>Phone: +234 8061936756</p>
            </div>
            
            {/* Email Section */}
            <div className='flex flex-col gap-2 md:gap-3 mt-4 text-xs md:text-sm'>
              <h1 className='flex gap-2 items-center font-semibold text-sm md:text-base'>
                <Mail size={24} className='text-white bg-red-600 p-1 rounded-full' /> 
                Write To US
              </h1>
              <p>Fill out our form and we will contact you within 24 hours</p>
              <p className='hover:underline cursor-pointer'>Email: customer@exclusive.com</p>
              <p className='hover:underline cursor-pointer'>Email: support@exclusive.com</p>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className='w-full max-w-[650px]'>
            {/* Status Message */}
            {submitStatus && (
              <div className={`mb-4 p-4 rounded-lg border flex items-start gap-3 ${
                submitStatus === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {submitStatus === 'success' ? (
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm">{statusMessage}</p>
                  <button 
                    onClick={() => {
                      setSubmitStatus(null);
                      setStatusMessage('');
                    }}
                    className="mt-2 text-xs underline hover:no-underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className='shadow-md rounded-md px-3 md:px-2 py-4 md:py-5'>
              {/* Form Inputs */}
              <div className='flex flex-col md:flex-row gap-3 md:gap-4'>
                <input 
                  type="text" 
                  name="name"
                  placeholder='Your Name *' 
                  value={formData.name}
                  onChange={handleInputChange}
                  className='bg-gray-50 rounded-sm p-2 w-full mb-3 md:mb-0 focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors' 
                  required
                />
                <input 
                  type="email" 
                  name="email"
                  placeholder='Your Email *' 
                  value={formData.email}
                  onChange={handleInputChange}
                  className='bg-gray-50 rounded-sm p-2 w-full mb-3 md:mb-0 focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors' 
                  required
                />
                <input 
                  type="tel" 
                  name="phone"
                  placeholder='Your Phone (Optional)' 
                  value={formData.phone}
                  onChange={handleInputChange}
                  className='bg-gray-50 rounded-sm p-2 w-full focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors' 
                />
              </div>
              
              {/* Message Textarea */}
              <textarea 
                placeholder='Your Message *' 
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className='bg-gray-50 rounded-sm p-2 w-full mt-3 md:mt-4 min-h-[120px] md:min-h-[180px] focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors'
                required
              ></textarea>
              
              {/* Submit Button Container */}
              <div className='flex justify-end mt-3 md:mt-4'>
                <button
                  type="submit"
                  disabled={isSubmitting || !emailJSLoaded}
                  className='px-6 py-2 bg-red-500 text-white text-xs md:text-sm font-semibold rounded-md cursor-pointer hover:bg-red-600 active:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm flex items-center gap-2'
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : !emailJSLoaded ? (
                    'Loading...'
                  ) : (
                    'Send Message'
                  )}
                </button>
              </div>
              
              {/* Loading Status */}
              {!emailJSLoaded && (
                <div className="text-center mt-2">
                  <p className="text-xs text-gray-500">Initializing email service...</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default ContactPage