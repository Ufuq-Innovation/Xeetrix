const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Submitting form..."); // চেক করার জন্য

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("Server Response:", data); // সার্ভার কি বলছে তা দেখুন

      if (data.success) {
        alert("অর্ডার সফলভাবে সেভ হয়েছে!");
      } else {
        alert("সার্ভার এরর: " + data.error);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("কানেকশন এরর! ইন্টারনেট বা ইউআরএল চেক করুন।");
    } finally {
      setLoading(false);
    }
  };