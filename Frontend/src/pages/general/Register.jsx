// frontend/src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaStore, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaArrowRight,
  FaCheckCircle,
  FaShieldAlt,
  FaBuilding,
  FaFileInvoice,
  FaExclamationTriangle,
  FaCity,
  FaGlobeAfrica
} from 'react-icons/fa';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// Nigerian States (36 + FCT)
import GoogleLoginButton from '../../components/GoogleLoginButton';
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
  'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
  'FCT Abuja'
];

// Comprehensive Local Government Areas by State
const LOCAL_GOVERNMENTS = {
  'Abia': [
    'Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North',
    'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo',
    'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu Nneochi'
  ],
  'Adamawa': [
    'Demsa', 'Fufure', 'Ganye', 'Gayuk', 'Girei', 'Gombi', 'Guyuk', 'Hong', 'Jada',
    'Lamurde', 'Madagali', 'Maiha', 'Mayo Belwa', 'Michika', 'Mubi North', 'Mubi South',
    'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South'
  ],
  'Akwa Ibom': [
    'Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo', 'Etinan',
    'Ibeno', 'Ibesikpo Asutan', 'Ibiono Ibom', 'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene',
    'Ini', 'Itu', 'Mbo', 'Mkpat Enin', 'Nsit Atai', 'Nsit Ibom', 'Nsit Ubium', 'Obot Akara',
    'Okobo', 'Onna', 'Oron', 'Oruk Anam', 'Udung Uko', 'Ukanafun', 'Uruan', 'Urue Offong/Oruko',
    'Uyo'
  ],
  'Anambra': [
    'Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South', 'Ayamelum',
    'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North',
    'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South',
    'Oyi'
  ],
  'Bauchi': [
    'Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darazo', 'Dass', 'Gamawa', 'Ganjuwa', 'Giade',
    'Itas/Gadau', 'Jama\'are', 'Katagum', 'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa Balewa',
    'Toro', 'Warji', 'Zaki'
  ],
  'Bayelsa': [
    'Brass', 'Ekeremor', 'Kolokuma/Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw',
    'Yenagoa'
  ],
  'Benue': [
    'Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West', 'Katsina-Ala',
    'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Ohimini', 'Oju', 'Okpokwu',
    'Otukpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'
  ],
  'Borno': [
    'Abadam', 'Askira/Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa', 'Dikwa', 'Gubio',
    'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Kaga', 'Kala/Balge', 'Konduga', 'Kukawa', 'Kwaya Kusar',
    'Mafa', 'Magumeri', 'Maiduguri', 'Marte', 'Mobbar', 'Monguno', 'Ngala', 'Nganzai', 'Shani'
  ],
  'Cross River': [
    'Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipal',
    'Calabar South', 'Etung', 'Ikom', 'Obanliku', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja',
    'Yakuur', 'Yala'
  ],
  'Delta': [
    'Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West',
    'Ika North East', 'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East', 'Ndokwa West',
    'Okpe', 'Oshimili North', 'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North',
    'Ughelli South', 'Ukwuani', 'Uvwie', 'Warri North', 'Warri South', 'Warri South West'
  ],
  'Ebonyi': [
    'Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South',
    'Ikwo', 'Ishielu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha'
  ],
  'Edo': [
    'Akoko Edo', 'Egor', 'Esan Central', 'Esan North East', 'Esan South East', 'Esan West',
    'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben', 'Ikpoba Okha', 'Oredo',
    'Orhionmwon', 'Ovia North East', 'Ovia South West', 'Owan East', 'Owan West', 'Uhunmwonde'
  ],
  'Ekiti': [
    'Ado Ekiti', 'Efon', 'Ekiti East', 'Ekiti South West', 'Ekiti West', 'Emure', 'Gbonyin',
    'Ido Osi', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje', 'Irepodun/Ifelodun', 'Ise/Orun',
    'Moba', 'Oye'
  ],
  'Enugu': [
    'Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu', 'Igbo Etiti',
    'Igbo Eze North', 'Igbo Eze South', 'Isi Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka',
    'Oji River', 'Udenu', 'Udi', 'Uzo Uwani'
  ],
  'Gombe': [
    'Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami',
    'Nafada', 'Shongom', 'Yamaltu/Deba'
  ],
  'Imo': [
    'Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte', 'Ideato North', 'Ideato South',
    'Ihitte/Uboma', 'Ikeduru', 'Isiala Mbano', 'Isu', 'Mbaitoli', 'Ngor Okpala', 'Njaba',
    'Nkwerre', 'Nwangele', 'Obowo', 'Oguta', 'Ohaji/Egbema', 'Okigwe', 'Onuimo', 'Orlu',
    'Orsu', 'Oru East', 'Oru West', 'Owerri Municipal', 'Owerri North', 'Owerri West'
  ],
  'Jigawa': [
    'Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Dutse', 'Gagarawa', 'Garki',
    'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin Hausa', 'Kaugama',
    'Kazaure', 'Kirikasamma', 'Kiyawa', 'Maigatari', 'Malam Madori', 'Miga', 'Ringim',
    'Roni', 'Sule Tankarkar', 'Taura', 'Yankwashi'
  ],
  'Kaduna': [
    'Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jema\'a', 'Kachia',
    'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau',
    'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria'
  ],
  'Kano': [
    'Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta',
    'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam',
    'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya',
    'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa',
    'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa',
    'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'
  ],
  'Katsina': [
    'Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi', 'Dandume',
    'Danja', 'Dan Musa', 'Daura', 'Dutsi', 'Dutsin Ma', 'Faskari', 'Funtua', 'Ingawa',
    'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Katsina', 'Kurfi', 'Kusada',
    'Mai\'Adua', 'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Sabuwa',
    'Safana', 'Sandamu', 'Zango'
  ],
  'Kebbi': [
    'Aleiro', 'Arewa Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin Kebbi', 'Bunza',
    'Dandi', 'Danko Wasagu', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko Besse',
    'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru', 'Wasagu/Danko', 'Yauri', 'Zuru'
  ],
  'Kogi': [
    'Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela Odolu',
    'Ijumu', 'Kabba/Bunu', 'Kogi', 'Lokoja', 'Mopa Muro', 'Ofu', 'Ogori/Magongo', 'Okehi',
    'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West'
  ],
  'Kwara': [
    'Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South', 'Ilorin West',
    'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke Ero', 'Oyun', 'Pategi'
  ],
  'Lagos': [
    'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe',
    'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island',
    'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'
  ],
  'Nasarawa': [
    'Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Keffi', 'Kokona', 'Lafia', 'Nasarawa',
    'Nasarawa Egon', 'Obi', 'Toto', 'Wamba'
  ],
  'Niger': [
    'Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara',
    'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa',
    'Moya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi'
  ],
  'Ogun': [
    'Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Egbado North', 'Egbado South',
    'Ewekoro', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode',
    'Ikenne', 'Imeko Afon', 'Ipokia', 'Obafemi Owode', 'Odeda', 'Odogbolu',
    'Ogun Waterside', 'Remo North', 'Shagamu'
  ],
  'Ondo': [
    'Akoko North East', 'Akoko North West', 'Akoko South East', 'Akoko South West',
    'Akure North', 'Akure South', 'Ese Odo', 'Idanre', 'Ifedore', 'Ilaje', 'Ile Oluji/Okeigbo',
    'Irele', 'Odigbo', 'Okitipupa', 'Ondo East', 'Ondo West', 'Ose', 'Owo'
  ],
  'Osun': [
    'Atakunmosa East', 'Atakunmosa West', 'Aiyedaade', 'Aiyedire', 'Boluwaduro', 'Boripe',
    'Ede North', 'Ede South', 'Egbedore', 'Ejigbo', 'Ife Central', 'Ife East', 'Ife North',
    'Ife South', 'Ila', 'Ilesa East', 'Ilesa West', 'Irepodun', 'Irewole', 'Isokan',
    'Iwo', 'Obokun', 'Odo Otin', 'Ola Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo'
  ],
  'Oyo': [
    'Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North', 'Ibadan North East',
    'Ibadan North West', 'Ibadan South East', 'Ibadan South West', 'Ibarapa Central',
    'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa',
    'Kajola', 'Lagelu', 'Ogbomosho North', 'Ogbomosho South', 'Ogo Oluwa', 'Olorunsogo',
    'Oluyole', 'Ona Ara', 'Orelope', 'Ori Ire', 'Oyo East', 'Oyo West', 'Saki East',
    'Saki West', 'Surulere'
  ],
  'Plateau': [
    'Barkin Ladi', 'Bassa', 'Bokkos', 'Jos East', 'Jos North', 'Jos South', 'Kanam',
    'Kanke', 'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin',
    'Qua\'an Pan', 'Riyom', 'Shendam', 'Wase'
  ],
  'Rivers': [
    'Abua–Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni', 'Asari-Toru',
    'Bonny', 'Degema', 'Eleme', 'Emuoha', 'Etche', 'Gokana', 'Ikwerre', 'Khana',
    'Obio-Akpor', 'Ogba–Egbema–Ndoni', 'Ogu–Bolo', 'Okrika', 'Omuma', 'Opobo–Nkoro',
    'Oyigbo', 'Port Harcourt', 'Tai'
  ],
  'Sokoto': [
    'Binji', 'Bodinga', 'Dange Shuni', 'Gada', 'Goronyo', 'Gudu', 'Gwadabawa', 'Illela',
    'Isa', 'Kebbe', 'Kware', 'Rabah', 'Sabon Birni', 'Shagari', 'Silame', 'Sokoto North',
    'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo'
  ],
  'Taraba': [
    'Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo', 'Karim Lamido',
    'Kumi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Yorro', 'Zing'
  ],
  'Yobe': [
    'Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gujba', 'Gulani', 'Jakusko',
    'Karasuwa', 'Machina', 'Nangere', 'Nguru', 'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari'
  ],
  'Zamfara': [
    'Anka', 'Bakura', 'Birnin Magaji/Kiyaw', 'Bukkuyum', 'Bungudu', 'Gummi', 'Gusau',
    'Kaura Namoda', 'Maradun', 'Maru', 'Shinkafi', 'Talata Mafara', 'Tsafe', 'Zurmi'
  ],
  'FCT Abuja': [
    'Abaji', 'Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali'
  ]
};

// Helper to get local governments for a given state
const getLocalGovernments = (state) => {
  return LOCAL_GOVERNMENTS[state] || [];
};

// Nigerian phone number validator
const isValidNigerianPhone = (phone) => {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  const regex = /^(0[7-9][0-1]\d{8})$|^(\+234[7-9][0-1]\d{8})$/;
  return regex.test(cleaned);
};

// Format phone number to a standard format (e.g., +234XXXXXXXXXX)
const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('0')) {
    return '+234' + cleaned.slice(1);
  }
  if (cleaned.startsWith('+234')) {
    return cleaned;
  }
  return phone;
};

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    state: '',
    localGovernment: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    taxId: '',
    storeDescription: ''
  });

  const [availableLGAs, setAvailableLGAs] = useState([]);

  // Update local government options when state changes
  useEffect(() => {
    if (formData.state) {
      const lgas = getLocalGovernments(formData.state);
      setAvailableLGAs(lgas);
      setFormData(prev => ({ ...prev, localGovernment: '' }));
    } else {
      setAvailableLGAs([]);
    }
  }, [formData.state]);

  // Debounced email check
  let emailTimeout;
  const checkEmailAvailability = (email) => {
    if (!email || email.length < 3) {
      setEmailAvailable(null);
      setEmailError('');
      return;
    }
    
    clearTimeout(emailTimeout);
    emailTimeout = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const response = await authAPI.checkEmail(email);
        if (response.data?.exists) {
          setEmailAvailable(false);
          setEmailError('This email is already registered. Please use a different email or login.');
        } else {
          setEmailAvailable(true);
          setEmailError('');
        }
      } catch (err) {
        console.error('Email check error:', err);
        setEmailAvailable(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    
    if (name === 'email') {
      checkEmailAvailability(value);
    }
    if (name === 'phoneNumber') {
      if (value && !isValidNigerianPhone(value)) {
        setPhoneError('Please enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)');
      } else {
        setPhoneError('');
      }
    }
  };

  const validateForm = () => {
    if (emailAvailable === false) {
      setError('This email is already registered. Please use a different email or login.');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms and Conditions');
      return false;
    }
    
    // Phone number validation
    if (!formData.phoneNumber) {
      setError('Phone number is required');
      return false;
    }
    if (!isValidNigerianPhone(formData.phoneNumber)) {
      setError('Please enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)');
      return false;
    }
    
    // State and Local Government validation
    if (!formData.state) {
      setError('Please select your state');
      return false;
    }
    if (!formData.localGovernment) {
      setError('Please select your local government area');
      return false;
    }
    
    if (formData.role === 'vendor') {
      if (!formData.businessName.trim()) {
        setError('Business name is required for vendor registration');
        return false;
      }
      if (!formData.storeDescription.trim()) {
        setError('Store description is required for vendor registration');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    const locationString = `${formData.localGovernment}, ${formData.state}, Nigeria`;

    try {
      const registrationData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formatPhoneNumber(formData.phoneNumber),
        location: locationString,
        role: formData.role,
        state: formData.state,
        localGovernment: formData.localGovernment
      };

      if (formData.role === 'vendor') {
        registrationData.businessName = formData.businessName;
        registrationData.businessAddress = formData.businessAddress;
        registrationData.businessPhone = formData.businessPhone || formData.phoneNumber;
        registrationData.taxId = formData.taxId;
        registrationData.storeDescription = formData.storeDescription;
      }

      const response = await authAPI.register(registrationData);
      
      if (response.data?.success) {
        toast.success(
          formData.role === 'vendor' 
            ? 'Vendor application submitted! We\'ll review it shortly.' 
            : 'Account created successfully!'
        );
        navigate('/login');
      } else if (response.data?.message?.includes('already exists')) {
        setError('An account with this email already exists. Please login instead.');
      } else {
        setError(response.data?.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      
      if (errorMessage.toLowerCase().includes('already exists') || 
          errorMessage.toLowerCase().includes('duplicate')) {
        setError('This email is already registered. Please login or use a different email.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: FaShieldAlt, text: 'Secure transactions' },
    { icon: FaCheckCircle, text: 'Verified sellers' },
    { icon: FaStore, text: 'Wide product range' }
  ];

  return (
    <div className="register-page" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center py-5">
        <Row className="w-100">
          <Col lg={10} className="mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 shadow-lg" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                <Row className="g-0">
                  {/* Left Side - Branding */}
                  <Col lg={5} className="bg-primary text-white d-none d-lg-block" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <div className="p-5 d-flex flex-column h-100">
                      <div className="mb-4">
                        <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex p-3 mb-3">
                          <FaStore size={32} className="text-white" />
                        </div>
                        <h2 className="fw-bold mb-2">Join MarketStore</h2>
                        <p className="text-white-50">Start your shopping journey today</p>
                      </div>
                      
                      <div className="mt-auto">
                        <h5 className="mb-3">Why join us?</h5>
                        {features.map((feature, idx) => {
                          const Icon = feature.icon;
                          return (
                            <div key={idx} className="d-flex align-items-center mb-3">
                              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                                <Icon size={16} />
                              </div>
                              <span className="small">{feature.text}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 pt-3 border-top border-white border-opacity-25">
                        <p className="small text-white-50 mb-0">
                          Already have an account?
                          <Link to="/login" className="text-white ms-2 fw-bold text-decoration-none">
                            Sign In →
                          </Link>
                        </p>
                      </div>
                    </div>
                  </Col>

                  {/* Right Side - Registration Form */}
                  <Col lg={7}>
                    <Card.Body className="p-4 p-lg-5" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                      <div className="text-center mb-4 d-lg-none">
                        <div className="bg-primary rounded-circle d-inline-flex p-3 mb-3">
                          <FaStore size={24} className="text-white" />
                        </div>
                        <h3 className="fw-bold">Create Account</h3>
                        <p className="text-muted">Join MarketStore today</p>
                      </div>

                      {error && (
                        <Alert variant="danger" onClose={() => setError('')} dismissible className="rounded-3">
                          <FaExclamationTriangle className="me-2" />
                          {error}
                        </Alert>
                      )}

                      {/* Google Registration */}
                      <div className="mb-4">
                        <GoogleLoginButton />
                        <div className="text-center my-3">
                          <span className="text-muted">or register with email</span>
                        </div>
                      </div>

                      <Form onSubmit={handleSubmit}>
                        {/* Role Selection */}
                        <Form.Group className="mb-4">
                          <Form.Label className="small fw-bold text-muted">I WANT TO REGISTER AS</Form.Label>
                          <div className="d-flex gap-3">
                            <div 
                              className={`flex-grow-1 border rounded-3 p-3 text-center cursor-pointer transition-all ${formData.role === 'user' ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`}
                              onClick={() => setFormData(prev => ({ ...prev, role: 'user' }))}
                              style={{ cursor: 'pointer' }}
                            >
                              <FaUser size={24} className={formData.role === 'user' ? 'text-primary' : 'text-muted'} />
                              <div className="mt-2">
                                <div className="fw-medium">Customer</div>
                                <small className="text-muted">Shop & Buy</small>
                              </div>
                            </div>
                            <div 
                              className={`flex-grow-1 border rounded-3 p-3 text-center cursor-pointer transition-all ${formData.role === 'vendor' ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`}
                              onClick={() => setFormData(prev => ({ ...prev, role: 'vendor' }))}
                              style={{ cursor: 'pointer' }}
                            >
                              <FaStore size={24} className={formData.role === 'vendor' ? 'text-primary' : 'text-muted'} />
                              <div className="mt-2">
                                <div className="fw-medium">Vendor</div>
                                <small className="text-muted">Sell Products</small>
                              </div>
                            </div>
                          </div>
                        </Form.Group>

                        {/* Basic Information */}
                        <h6 className="fw-bold mb-3">Basic Information</h6>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="small fw-bold text-muted">FULL NAME *</Form.Label>
                              <InputGroup className="border rounded-3 overflow-hidden">
                                <InputGroup.Text className="bg-white border-0">
                                  <FaUser className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                  type="text"
                                  name="fullName"
                                  placeholder="Enter your full name"
                                  value={formData.fullName}
                                  onChange={handleChange}
                                  required
                                  className="border-0 py-3 fs-6"
                                  style={{
                                    background: 'transparent',
                                    fontWeight: '500',
                                    borderRadius: '0 8px 8px 0'
                                  }}
                                />
                              </InputGroup>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="small fw-bold text-muted">EMAIL *</Form.Label>
                              <InputGroup className="border rounded-3 overflow-hidden">
                                <InputGroup.Text className="bg-white border-0">
                                  <FaEnvelope className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                  type="email"
                                  name="email"
                                  placeholder="hello@example.com"
                                  value={formData.email}
                                  onChange={handleChange}
                                  required
                                  className="border-0 py-2"
                                  style={{ background: '#f8f9fa' }}
                                />
                                {checkingEmail && (
                                  <InputGroup.Text className="bg-white border-0">
                                    <Spinner size="sm" />
                                  </InputGroup.Text>
                                )}
                                {emailAvailable === true && !checkingEmail && (
                                  <InputGroup.Text className="bg-white border-0 text-success">
                                    <FaCheckCircle />
                                  </InputGroup.Text>
                                )}
                                {emailAvailable === false && !checkingEmail && (
                                  <InputGroup.Text className="bg-white border-0 text-danger">
                                    <FaExclamationTriangle />
                                  </InputGroup.Text>
                                )}
                              </InputGroup>
                              {emailError && (
                                <Form.Text className="text-danger">
                                  {emailError}
                                </Form.Text>
                              )}
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="small fw-bold text-muted">PHONE NUMBER *</Form.Label>
                              <InputGroup className="border rounded-3 overflow-hidden">
                                <InputGroup.Text className="bg-white border-0">
                                  <FaPhone className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                  type="tel"
                                  name="phoneNumber"
                                  placeholder="08012345678 or +2348012345678"
                                  value={formData.phoneNumber}
                                  onChange={handleChange}
                                  required
                                  isInvalid={!!phoneError}
                                  className="border-0 py-2"
                                  style={{ background: '#f8f9fa' }}
                                />
                              </InputGroup>
                              {phoneError && (
                                <Form.Text className="text-danger">
                                  {phoneError}
                                </Form.Text>
                              )}
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="small fw-bold text-muted">STATE *</Form.Label>
                              <InputGroup className="border rounded-3 overflow-hidden">
                                <InputGroup.Text className="bg-white border-0">
                                  <FaGlobeAfrica className="text-muted" />
                                </InputGroup.Text>
                                <Form.Select
                                  name="state"
                                  value={formData.state}
                                  onChange={handleChange}
                                  required
                                  className="border-0 py-2"
                                  style={{ background: '#f8f9fa' }}
                                >
                                  <option value="">Select State</option>
                                  {NIGERIAN_STATES.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                  ))}
                                </Form.Select>
                              </InputGroup>
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={12}>
                            <Form.Group className="mb-3">
                              <Form.Label className="small fw-bold text-muted">LOCAL GOVERNMENT AREA *</Form.Label>
                              <InputGroup className="border rounded-3 overflow-hidden">
                                <InputGroup.Text className="bg-white border-0">
                                  <FaCity className="text-muted" />
                                </InputGroup.Text>
                                <Form.Select
                                  name="localGovernment"
                                  value={formData.localGovernment}
                                  onChange={handleChange}
                                  required
                                  disabled={!formData.state}
                                  className="border-0 py-2"
                                  style={{ background: '#f8f9fa' }}
                                >
                                  <option value="">Select Local Government</option>
                                  {availableLGAs.map(lga => (
                                    <option key={lga} value={lga}>{lga}</option>
                                  ))}
                                </Form.Select>
                              </InputGroup>
                            </Form.Group>
                          </Col>
                        </Row>

                        {/* Vendor Information */}
                        {formData.role === 'vendor' && (
                          <>
                            <h6 className="fw-bold mb-3 mt-4">Business Information</h6>
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label className="small fw-bold text-muted">BUSINESS NAME *</Form.Label>
                                  <InputGroup className="border rounded-3 overflow-hidden">
                                    <InputGroup.Text className="bg-white border-0">
                                      <FaBuilding className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                      type="text"
                                      name="businessName"
                                      placeholder="Your Store Name"
                                      value={formData.businessName}
                                      onChange={handleChange}
                                      required
                                      className="border-0 py-2"
                                      style={{ background: '#f8f9fa' }}
                                    />
                                  </InputGroup>
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label className="small fw-bold text-muted">BUSINESS PHONE</Form.Label>
                                  <InputGroup className="border rounded-3 overflow-hidden">
                                    <InputGroup.Text className="bg-white border-0">
                                      <FaPhone className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                      type="tel"
                                      name="businessPhone"
                                      placeholder="+234 801 234 5678"
                                      value={formData.businessPhone}
                                      onChange={handleChange}
                                      className="border-0 py-2"
                                      style={{ background: '#f8f9fa' }}
                                    />
                                  </InputGroup>
                                </Form.Group>
                              </Col>
                            </Row>

                            <Form.Group className="mb-3">
                              <Form.Label className="small fw-bold text-muted">BUSINESS ADDRESS</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={2}
                                name="businessAddress"
                                placeholder="Enter your business address"
                                value={formData.businessAddress}
                                onChange={handleChange}
                                className="border rounded-3"
                                style={{ background: '#f8f9fa' }}
                              />
                            </Form.Group>

                            <Row>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label className="small fw-bold text-muted">TAX ID / RC NUMBER</Form.Label>
                                  <InputGroup className="border rounded-3 overflow-hidden">
                                    <InputGroup.Text className="bg-white border-0">
                                      <FaFileInvoice className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                      type="text"
                                      name="taxId"
                                      placeholder="Optional"
                                      value={formData.taxId}
                                      onChange={handleChange}
                                      className="border-0 py-2"
                                      style={{ background: '#f8f9fa' }}
                                    />
                                  </InputGroup>
                                </Form.Group>
                              </Col>
                            </Row>

                            <Form.Group className="mb-3">
                              <Form.Label className="small fw-bold text-muted">STORE DESCRIPTION *</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={3}
                                name="storeDescription"
                                placeholder="Tell customers about your store, what you sell, and what makes you special..."
                                value={formData.storeDescription}
                                onChange={handleChange}
                                required
                                className="border rounded-3"
                                style={{ background: '#f8f9fa' }}
                              />
                            </Form.Group>
                          </>
                        )}

                        {/* Password Fields */}
                        <h6 className="fw-bold mb-3 mt-4">Security</h6>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="small fw-bold text-muted">PASSWORD *</Form.Label>
                              <InputGroup className="border rounded-3 overflow-hidden">
                                <Form.Control
                                  type={showPassword ? 'text' : 'password'}
                                  name="password"
                                  placeholder="Minimum 6 characters"
                                  value={formData.password}
                                  onChange={handleChange}
                                  required
                                  className="border-0 py-2"
                                  style={{ background: '#f8f9fa' }}
                                />
                                <Button
                                  variant="link"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="border-0 bg-white text-muted"
                                >
                                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </Button>
                              </InputGroup>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="small fw-bold text-muted">CONFIRM PASSWORD *</Form.Label>
                              <InputGroup className="border rounded-3 overflow-hidden">
                                <Form.Control
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  name="confirmPassword"
                                  placeholder="Confirm your password"
                                  value={formData.confirmPassword}
                                  onChange={handleChange}
                                  required
                                  className="border-0 py-2"
                                  style={{ background: '#f8f9fa' }}
                                />
                                <Button
                                  variant="link"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="border-0 bg-white text-muted"
                                >
                                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </Button>
                              </InputGroup>
                            </Form.Group>
                          </Col>
                        </Row>

                        {/* Terms and Conditions */}
                        <Form.Group className="mb-4">
                          <Form.Check
                            type="checkbox"
                            label={
                              <span className="small">
                                I agree to the <Link to="/terms" className="text-decoration-none">Terms of Service</Link> and 
                                <Link to="/privacy" className="text-decoration-none ms-1">Privacy Policy</Link>
                              </span>
                            }
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            required
                          />
                        </Form.Group>

                        <Button 
                          type="submit" 
                          variant="primary" 
                          className="w-100 py-3 rounded-3 fw-bold"
                          disabled={loading || emailAvailable === false}
                          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                        >
                          {loading ? (
                            <>
                              <Spinner size="sm" className="me-2" />
                              Creating Account...
                            </>
                          ) : (
                            <>
                              Create Account <FaArrowRight className="ms-2" />
                            </>
                          )}
                        </Button>

                        <div className="text-center mt-4 d-lg-none">
                          <span className="text-muted small">Already have an account? </span>
                          <Link to="/login" className="text-decoration-none small fw-bold">
                            Sign In
                          </Link>
                        </div>

                        {/* Security Badge */}
                        <div className="text-center mt-4 pt-3 border-top">
                          <FaShieldAlt className="text-muted me-2" />
                          <small className="text-muted">
                            256-bit SSL encrypted • Your data is safe with us
                          </small>
                        </div>
                      </Form>
                    </Card.Body>
                  </Col>
                </Row>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Register;
