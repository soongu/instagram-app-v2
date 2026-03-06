// Signup.jsx
import {useCallback, useEffect, useState} from 'react';
import styles from '../../pages/auth/SignupPage.module.scss';
import {checkPasswordStrength, ValidationRules} from "../../utils/ValidationRules";
import {debounce} from "lodash";
import {useNavigate} from "react-router-dom";
import {authApi} from "../../services/api.js";

const Signup = () => {

  const navigate = useNavigate();

  // 입력값들을 상태관리
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    username: '',
    password: '',
  });

  // 입력 에러메시지를 상태관리
  const [errors, setErrors] = useState({
    email: '',
    name: '',
    username: '',
    password: '',
  });

  // 비밀번호 강도 상태 추가
  const [passwordStrength, setPasswordStrength] = useState({
    type: '',
    message: '',
  });

  // 비밀번호 보기/숨기기 상태
  const [showPassword, setShowPassword] = useState(false);

  // 버튼 활성화 상태를 관리할 state 추가
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);


  // 입력값 검증을 수행하는 함수
  const validateField = async (fieldName, value) => {
    let errorMessage = '';

    // email 필드는 emailOrPhone 검증 룰을 사용합니다.
    const ruleName = fieldName === 'email' ? 'emailOrPhone' : fieldName;

    if (!value) {
      errorMessage = ValidationRules[ruleName].requiredMessage;
    } else if (ValidationRules[ruleName].pattern && !ValidationRules[ruleName].pattern.test(value)) {
      errorMessage = ValidationRules[ruleName].message;
    }

    // 중복 체크가 필요한 필드인 경우
    if (!errorMessage && (fieldName === 'email' || fieldName === 'username')) {
      try {
        let checkType = fieldName;
        // 이메일 필드에서 전화번호 패턴일 경우 type을 'phone'으로 설정
        if (fieldName === 'email' && /^010-\d{4}-\d{4}$/.test(value)) {
          checkType = 'phone';
        }
        
        // 전화번호인 경우 하이픈 제거 후 전송 (이메일은 영향 없음)
        const sendValue = fieldName === 'email' ? value.replace(/-/g, '') : value;
        const response = await authApi.checkDuplicate(checkType, sendValue);
        const { available, message } = response.data;

        if (!available) {
          errorMessage = message;
        }
      } catch (error) {
        console.error('중복 체크 중 에러 발생:', error);
        errorMessage = '중복 확인에 실패했습니다. 다시 시도해주세요.';
      }
    }

    return errorMessage;
  };

  // Debounce된 검증 함수 생성
  const debouncedValidateField = useCallback(
    debounce(async (fieldName, value) => {
      const errorMessage = await validateField(fieldName, value);

      setErrors(prevErrors => ({
        ...prevErrors,
        [fieldName]: errorMessage
      }));

      // 비밀번호 강도 체크
      if (fieldName === 'password') {
        const strength = checkPasswordStrength(value);
        switch (strength) {
          case 'weak':
            setPasswordStrength({
              type: 'weak',
              message: ValidationRules.password.messages.weak,
            });
            break;
          case 'medium':
            setPasswordStrength({
              type: 'medium',
              message: ValidationRules.password.messages.medium,
            });
            break;
          case 'strong':
            setPasswordStrength({
              type: 'strong',
              message: ValidationRules.password.messages.strong,
            });
            break;
          default:
            setPasswordStrength({type: '', message: ''});
        }
      }

    }, 500),
    []
  );

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // 입력 필드별 디바운스 검증
    debouncedValidateField(name, value);


  };

  // 비밀번호 보기/숨기기 토글
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  // 폼 유효성 검사 함수 추가
  const validateForm = () => {
    // 모든 필드가 채워져 있고 에러가 없는지 확인
    const isAllFieldsFilled = Object.values(formData).every(value => value.trim() !== '');
    const isNoErrors = Object.values(errors).every(error => error === '');
    const isStrongPassword = passwordStrength.type !== 'weak';

    // 모든 조건을 만족하면 submit 버튼 활성화
    setIsSubmitDisabled(!(isAllFieldsFilled && isNoErrors && isStrongPassword));
  };

  // formData나 errors가 변경될 때마다 유효성 검사
  useEffect(() => {
    validateForm();
  }, [formData, errors, passwordStrength]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await authApi.signup({
        emailOrPhone: formData.email.replace(/-/g, ''), // 전화번호인 경우 하이픈 제거
        name: formData.name,
        username: formData.username,
        password: formData.password,
      });

      // 회원가입 성공시 처리
      // API 응답이 성공(200 OK 또는 201 Created 등)이면 예외가 발생하지 않으므로 로그인 페이지로 이동합니다.
      // 로그인 입력란을 자동 완성하고 토스트 메시지를 띄우기 위해 방금 가입한 아이디를 state로 함께 넘깁니다.
      navigate('/', { state: { registeredId: formData.username } });
    } catch (error) {
      // 서버에서 에러 응답이 온 경우
      if (error.response?.data) {
        const { field, message } = error.response.data;
        if (field) {
          // 특정 필드에 대한 에러
          setErrors(prev => ({
            ...prev,
            [field]: message
          }));
        } else {
          // 일반적인 에러
          alert(message || '회원가입에 실패했습니다.');
        }
      } else {
        // 네트워크 에러 등의 경우
        alert('서버와의 통신에 실패했습니다.');
      }
    }
  };

  return (
    <form className={styles.authForm} onSubmit={handleSubmit} noValidate>
      <div className={`${styles.formField} ${errors.email ? styles.error : formData.email && !errors.email ? styles.success : ''}`}>
        <div className={styles.inputContainer}>
          <input
            type="email"
            name="email"
            placeholder="휴대폰 번호 또는 이메일 주소"
            required
            value={formData.email}
            onChange={handleChange}
          />
          {formData.email && !errors.email && <div className={styles.successIcon}></div>}
          {errors.email && <div className={styles.errorIcon}></div>}
        </div>
        {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
      </div>

      <div className={`${styles.formField} ${errors.name ? styles.error : formData.name && !errors.name ? styles.success : ''}`}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            name="name"
            placeholder="성명"
            required
            value={formData.name}
            onChange={handleChange}
          />
          {formData.name && !errors.name && <div className={styles.successIcon}></div>}
          {errors.name && <div className={styles.errorIcon}></div>}
        </div>
        {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
      </div>

      <div className={`${styles.formField} ${errors.username ? styles.error : formData.username && !errors.username ? styles.success : ''}`}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            name="username"
            placeholder="사용자 이름"
            required
            value={formData.username}
            onChange={handleChange}
          />
          {formData.username && !errors.username && <div className={styles.successIcon}></div>}
          {errors.username && <div className={styles.errorIcon}></div>}
        </div>
        {errors.username && <span className={styles.errorMessage}>{errors.username}</span>}
      </div>

      <div className={`${styles.formField} ${errors.password || (formData.password && passwordStrength.type === 'weak') ? styles.error : formData.password && !errors.password && passwordStrength.type !== 'weak' ? styles.success : ''}`}>
        <div className={styles.inputContainer}>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="비밀번호"
            required
            value={formData.password}
            onChange={handleChange}
            style={formData.password ? { paddingRight: '100px' } : {}}
          />

          {formData.password && !errors.password && passwordStrength.type !== 'weak' && (
             <div className={styles.successIcon}></div>
          )}
          {(errors.password || (formData.password && passwordStrength.type === 'weak')) && (
             <div className={styles.errorIcon}></div>
          )}

          {formData.password && (
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={togglePasswordVisibility}
              style={{ right: '32px' }} // 아이콘 폭 확보용 추가 간격
            >
              {showPassword ? '숨기기' : '비밀번호 표시'}
            </button>
          )}

        </div>

        {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
        {formData.password && (
          <div
            className={`
              ${styles.passwordFeedback} 
              ${styles[passwordStrength.type]}
            `}
          >
            {passwordStrength.message}
          </div>
        )}
      </div>

      <p className={styles.privacyText}>
        저희 서비스를 이용하는 사람이 회원님의 연락처 정보를 Instagram에 업로드했을 수도 있습니다.
        <a href="#">더 알아보기</a>
      </p>

      <button type="submit" className={styles.authButton} disabled={isSubmitDisabled}>가입</button>

    </form>
  );
}

export default Signup;