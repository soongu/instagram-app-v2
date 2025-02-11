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

    if (!value) {
      errorMessage = ValidationRules[fieldName].requiredMessage;
    } else if (ValidationRules[fieldName].pattern && !ValidationRules[fieldName].pattern.test(value)) {
      errorMessage = ValidationRules[fieldName].message;
    }

    // 중복 체크가 필요한 필드인 경우
    if (!errorMessage && (fieldName === 'email' || fieldName === 'username')) {
      try {
        const response = await authApi.checkDuplicate(fieldName, value);
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


  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 회원가입 요청
  };

  return (
    <form className={styles.authForm} onSubmit={handleSubmit} noValidate>
      <div className={styles.formField}>
        <input
          type="email"
          name="email"
          placeholder="휴대폰 번호 또는 이메일 주소"
          required
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
      </div>

      <div className={styles.formField}>
        <input
          type="text"
          name="name"
          placeholder="성명"
          required
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
      </div>

      <div className={styles.formField}>
        <input
          type="text"
          name="username"
          placeholder="사용자 이름"
          required
          value={formData.username}
          onChange={handleChange}
        />
        {errors.username && <span className={styles.errorMessage}>{errors.username}</span>}
      </div>

      <div className={styles.formField}>
        <div className={styles.inputContainer}>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="비밀번호"
            required
            value={formData.password}
            onChange={handleChange}
          />

          {formData.password && (
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={togglePasswordVisibility}
            >
              {showPassword ? '숨기기' : '패스워드 표시'}
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