// 무료 날씨 API 사용 (API 키 불필요)
const API_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// DOM 요소들 (페이지 로드 후 초기화)
let cityInput, searchBtn, weatherInfo, loading, error;
let cityName, date, temp, weatherIcon, weatherDesc, feelsLike, humidity, windSpeed, visibility, errorMessage;

// 날씨 코드를 설명으로 변환하는 함수
function getWeatherDescription(code) {
    const descriptions = {
        0: '맑음',
        1: '대체로 맑음',
        2: '부분적으로 흐림',
        3: '흐림',
        45: '안개',
        48: '서리 안개',
        51: '가벼운 이슬비',
        53: '이슬비',
        55: '강한 이슬비',
        56: '가벼운 얼음 이슬비',
        57: '얼음 이슬비',
        61: '가벼운 비',
        63: '비',
        65: '강한 비',
        66: '가벼운 얼음비',
        67: '얼음비',
        71: '가벼운 눈',
        73: '눈',
        75: '강한 눈',
        77: '눈알',
        80: '가벼운 소나기',
        81: '소나기',
        82: '강한 소나기',
        85: '가벼운 눈 소나기',
        86: '눈 소나기',
        95: '천둥번개',
        96: '우박과 함께하는 천둥번개',
        99: '강한 우박과 함께하는 천둥번개'
    };
    return descriptions[code] || '알 수 없음';
}

// 날씨 코드를 아이콘으로 변환하는 함수
function getWeatherIcon(code) {
    const icons = {
        0: 'fas fa-sun',
        1: 'fas fa-cloud-sun',
        2: 'fas fa-cloud-sun',
        3: 'fas fa-cloud',
        45: 'fas fa-smog',
        48: 'fas fa-smog',
        51: 'fas fa-cloud-drizzle',
        53: 'fas fa-cloud-drizzle',
        55: 'fas fa-cloud-drizzle',
        56: 'fas fa-cloud-drizzle',
        57: 'fas fa-cloud-drizzle',
        61: 'fas fa-cloud-rain',
        63: 'fas fa-cloud-rain',
        65: 'fas fa-cloud-showers-heavy',
        66: 'fas fa-cloud-rain',
        67: 'fas fa-cloud-rain',
        71: 'fas fa-snowflake',
        73: 'fas fa-snowflake',
        75: 'fas fa-snowflake',
        77: 'fas fa-snowflake',
        80: 'fas fa-cloud-rain',
        81: 'fas fa-cloud-showers-heavy',
        82: 'fas fa-cloud-showers-heavy',
        85: 'fas fa-cloud-snow',
        86: 'fas fa-cloud-snow',
        95: 'fas fa-bolt',
        96: 'fas fa-bolt',
        99: 'fas fa-bolt'
    };
    return icons[code] || 'fas fa-cloud';
}

// DOM 요소 초기화 함수
function initializeElements() {
    cityInput = document.getElementById('cityInput');
    searchBtn = document.getElementById('searchBtn');
    weatherInfo = document.getElementById('weatherInfo');
    loading = document.getElementById('loading');
    error = document.getElementById('error');
    
    cityName = document.getElementById('cityName');
    date = document.getElementById('date');
    temp = document.getElementById('temp');
    weatherIcon = document.getElementById('weatherIcon');
    weatherDesc = document.getElementById('weatherDesc');
    feelsLike = document.getElementById('feelsLike');
    humidity = document.getElementById('humidity');
    windSpeed = document.getElementById('windSpeed');
    visibility = document.getElementById('visibility');
    errorMessage = document.getElementById('errorMessage');
    
    // 이벤트 리스너 등록
    if (searchBtn && cityInput) {
        searchBtn.addEventListener('click', getWeather);
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                getWeather();
            }
        });
        
        // 입력 필드에 포커스 시 도시 예시 표시
        cityInput.addEventListener('focus', showCityExamples);
        cityInput.addEventListener('blur', hideCityExamples);
    }
}



// 날씨 정보 가져오기
async function getWeather() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('도시명을 입력해주세요.');
        return;
    }
    
    showLoading();
    
    try {
        // 도시 검색 (여러 언어로 시도)
        const result = await searchCity(city);
        if (result) {
            displayWeather(result.weatherData, result.cityName);
        } else {
            throw new Error('도시를 찾을 수 없습니다. 정확한 도시명을 입력해주세요.');
        }
        
    } catch (error) {
        console.error('날씨 정보 가져오기 오류:', error);
        showError(error.message);
    }
}

// 통합 도시 검색 함수
async function searchCity(city) {
    // 도시명 매핑 (한글/일본어 → 영어)
    const cityMap = {
        '서울': 'Seoul',
        '부산': 'Busan',
        '대구': 'Daegu',
        '인천': 'Incheon',
        '광주': 'Gwangju',
        '대전': 'Daejeon',
        '울산': 'Ulsan',
        '기후': 'Gifu',
        '岐阜': 'Gifu',
        '도쿄': 'Tokyo',
        '東京': 'Tokyo',
        '오사카': 'Osaka',
        '大阪': 'Osaka',
        '교토': 'Kyoto',
        '京都': 'Kyoto',
        '나고야': 'Nagoya',
        '名古屋': 'Nagoya',
        '요코하마': 'Yokohama',
        '横浜': 'Yokohama',
        '후쿠오카': 'Fukuoka',
        '福岡': 'Fukuoka',
        '삿포로': 'Sapporo',
        '札幌': 'Sapporo',
        '고베': 'Kobe',
        '神戸': 'Kobe'
    };
    
    // 매핑된 영어 이름이 있으면 사용
    const searchName = cityMap[city] || city;
    
    try {
        // 영어로 검색 시도
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchName)}&count=5&language=en&format=json`);
        
        if (!response.ok) {
            console.log('API 응답 오류:', response.status);
            return null;
        }
        
        const data = await response.json();
        console.log('검색 결과:', data);
        
        if (!data.results || data.results.length === 0) {
            console.log('검색 결과 없음');
            return null;
        }
        
        const { latitude, longitude } = data.results[0];
        console.log('좌표:', latitude, longitude);
        
        // 날씨 정보 가져오기
        const weatherResponse = await fetch(`${API_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,visibility&timezone=auto`);
        
        if (!weatherResponse.ok) {
            console.log('날씨 API 응답 오류:', weatherResponse.status);
            return null;
        }
        
        const weatherData = await weatherResponse.json();
        console.log('날씨 데이터:', weatherData);
        
        return { 
            weatherData, 
            cityName: data.results[0].name 
        };
        
    } catch (error) {
        console.error('검색 오류:', error);
        return null;
    }
}

// 언어 감지 함수 (현재는 사용하지 않음)
function detectLanguage(text) {
    // 한글 감지
    if (/[가-힣]/.test(text)) {
        return 'ko';
    }
    // 일본어/중국어 한자 감지
    else if (/[\u4E00-\u9FFF]/.test(text)) {
        return 'ja';
    }
    // 기본값은 영어
    else {
        return 'en';
    }
}

// 도시 예시 표시 함수
function showCityExamples() {
    // 기존 예시 제거
    hideCityExamples();
    
    const examples = [
        { ko: '서울', ja: 'ソウル', en: 'Seoul' },
        { ko: '부산', ja: '釜山', en: 'Busan' },
        { ko: '도쿄', ja: '東京', en: 'Tokyo' },
        { ko: '오사카', ja: '大阪', en: 'Osaka' },
        { ko: '기후', ja: '岐阜', en: 'Gifu' },
        { ko: '교토', ja: '京都', en: 'Kyoto' },
        { ko: '나고야', ja: '名古屋', en: 'Nagoya' },
        { ko: '요코하마', ja: '横浜', en: 'Yokohama' },
        { ko: '뉴욕', ja: 'ニューヨーク', en: 'New York' },
        { ko: '런던', ja: 'ロンドン', en: 'London' }
    ];
    
    const examplesDiv = document.createElement('div');
    examplesDiv.id = 'cityExamples';
    examplesDiv.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
        max-height: 200px;
        overflow-y: auto;
        margin-top: 5px;
    `;
    
    examples.forEach(city => {
        const cityDiv = document.createElement('div');
        cityDiv.style.cssText = `
            padding: 10px 15px;
            cursor: pointer;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        cityDiv.innerHTML = `
            <span style="color: #333;">${city.ko}</span>
            <span style="color: #666; font-size: 0.9em;">${city.ja} / ${city.en}</span>
        `;
        
        cityDiv.addEventListener('click', () => {
            cityInput.value = city.ko;
            getWeather();
            hideCityExamples();
        });
        
        cityDiv.addEventListener('mouseenter', () => {
            cityDiv.style.backgroundColor = '#f8f9fa';
        });
        
        cityDiv.addEventListener('mouseleave', () => {
            cityDiv.style.backgroundColor = 'white';
        });
        
        examplesDiv.appendChild(cityDiv);
    });
    
    // 검색 박스에 상대적으로 위치시키기
    const searchBox = cityInput.parentElement;
    searchBox.style.position = 'relative';
    searchBox.appendChild(examplesDiv);
}

// 도시 예시 숨기기 함수
function hideCityExamples() {
    const examplesDiv = document.getElementById('cityExamples');
    if (examplesDiv) {
        examplesDiv.remove();
    }
}

// 좌표로 날씨 정보 가져오기
async function getWeatherByCoords(lat, lon) {
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,visibility&timezone=auto`);
        
        if (!response.ok) {
            throw new Error('날씨 정보를 가져오는데 실패했습니다.');
        }
        
        const data = await response.json();
        // 도시명을 가져오기 위해 역지오코딩
        const reverseGeocodingResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=ko`);
        let cityName = '현재 위치';
        
        if (reverseGeocodingResponse.ok) {
            const reverseData = await reverseGeocodingResponse.json();
            if (reverseData.name) {
                cityName = reverseData.name;
            }
        }
        
        displayWeather(data, cityName);
        
    } catch (error) {
        console.error('날씨 정보 가져오기 오류:', error);
        showError(error.message);
    }
}

// 날씨 정보 표시
function displayWeather(data, cityNameText) {
    hideLoading();
    hideError();
    
    // 도시명과 날짜
    cityName.textContent = cityNameText;
    date.textContent = formatDate(new Date());
    
    // 온도
    temp.textContent = Math.round(data.current.temperature_2m);
    
    // 날씨 코드를 설명으로 변환
    const weatherCode = data.current.weather_code;
    const weatherDescription = getWeatherDescription(weatherCode);
    weatherDesc.textContent = weatherDescription;
    
    // 날씨 아이콘 설정
    const iconClass = getWeatherIcon(weatherCode);
    weatherIcon.className = iconClass;
    
    // 상세 정보
    feelsLike.textContent = `${Math.round(data.current.apparent_temperature)}°C`;
    humidity.textContent = `${data.current.relative_humidity_2m}%`;
    windSpeed.textContent = `${data.current.wind_speed_10m} m/s`;
    visibility.textContent = `${(data.current.visibility / 1000).toFixed(1)} km`;
    
    // 날씨에 따른 배경색 변경
    updateBackground(weatherCode);
    
    showWeatherInfo();
}

// 날짜 포맷팅
function formatDate(date) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return date.toLocaleDateString('ko-KR', options);
}

// 날씨에 따른 배경색 변경
function updateBackground(weatherCode) {
    const body = document.body;
    
    // 기존 클래스 제거
    body.className = '';
    
    // 날씨 코드에 따른 클래스 추가
    if (weatherCode >= 0 && weatherCode <= 3) {
        // 맑음 ~ 흐림
        if (weatherCode === 0) {
            body.classList.add('clear-weather');
        } else {
            body.classList.add('cloudy-weather');
        }
    } else if (weatherCode >= 45 && weatherCode <= 48) {
        // 안개
        body.classList.add('foggy-weather');
    } else if (weatherCode >= 51 && weatherCode <= 67) {
        // 비
        body.classList.add('rainy-weather');
    } else if (weatherCode >= 71 && weatherCode <= 77) {
        // 눈
        body.classList.add('snowy-weather');
    } else if (weatherCode >= 80 && weatherCode <= 86) {
        // 소나기
        body.classList.add('rainy-weather');
    } else if (weatherCode >= 95 && weatherCode <= 99) {
        // 천둥번개
        body.classList.add('stormy-weather');
    } else {
        body.classList.add('default-weather');
    }
}

// 로딩 표시
function showLoading() {
    loading.style.display = 'block';
    weatherInfo.style.display = 'none';
    error.style.display = 'none';
}

// 로딩 숨기기
function hideLoading() {
    loading.style.display = 'none';
}

// 날씨 정보 표시
function showWeatherInfo() {
    weatherInfo.style.display = 'block';
}

// 에러 표시
function showError(message) {
    hideLoading();
    weatherInfo.style.display = 'none';
    error.style.display = 'block';
    errorMessage.textContent = message;
}

// 에러 숨기기
function hideError() {
    error.style.display = 'none';
}

// 날씨별 배경 스타일 추가
const style = document.createElement('style');
style.textContent = `
    .clear-weather {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%) !important;
    }
    
    .cloudy-weather {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%) !important;
    }
    
    .foggy-weather {
        background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%) !important;
    }
    
    .rainy-weather {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    }
    
    .snowy-weather {
        background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%) !important;
    }
    
    .stormy-weather {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
    }
    
    .default-weather {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    }
`;
document.head.appendChild(style);

// 질문 게시판 기능
let questions = JSON.parse(localStorage.getItem('questions')) || [];
let questionIdCounter = JSON.parse(localStorage.getItem('questionIdCounter')) || 1;

// 질문 게시판 초기화
function initializeQuestionBoard() {
    const questionForm = document.getElementById('questionForm');
    const filterSubject = document.getElementById('filterSubject');
    
    if (questionForm) {
        questionForm.addEventListener('submit', handleQuestionSubmit);
    }
    
    if (filterSubject) {
        filterSubject.addEventListener('change', filterQuestions);
    }
    
    // 샘플 질문 추가 (처음 실행 시)
    if (questions.length === 0) {
        addSampleQuestions();
    }
    
    displayQuestions();
}

// 샘플 질문 추가
function addSampleQuestions() {
    const sampleQuestions = [
        {
            id: 1,
            subject: '수학',
            title: '미분법에 대해 궁금합니다',
            content: '미분법의 기본 개념과 활용 방법에 대해 설명해주세요. 특히 도함수의 의미가 잘 이해되지 않습니다.',
            author: '김학생',
            date: new Date(Date.now() - 86400000).toLocaleDateString('ko-KR'),
            answers: [
                {
                    author: '박선생님',
                    content: '미분은 함수의 변화율을 나타내는 개념입니다. 도함수는 특정 점에서의 기울기를 의미하며, 이를 통해 함수의 증가/감소를 판단할 수 있습니다.',
                    date: new Date(Date.now() - 43200000).toLocaleDateString('ko-KR')
                }
            ]
        },
        {
            id: 2,
            subject: '과학',
            title: '화학 반응식 균형 맞추기',
            content: '화학 반응식에서 계수를 맞추는 방법을 알려주세요. 산화-환원 반응에서 특히 어려워합니다.',
            author: '이학생',
            date: new Date(Date.now() - 172800000).toLocaleDateString('ko-KR'),
            answers: []
        },
        {
            id: 3,
            subject: '영어',
            title: '관계대명사 that과 which의 차이점',
            content: '관계대명사 that과 which를 언제 사용해야 하는지 구분하는 방법을 알려주세요.',
            author: '최학생',
            date: new Date(Date.now() - 259200000).toLocaleDateString('ko-KR'),
            answers: [
                {
                    author: '김영어선생님',
                    content: 'that은 제한적 용법에서 사용되며, which는 비제한적 용법에서 주로 사용됩니다. 쉼표가 있으면 which를 사용하는 것이 일반적입니다.',
                    date: new Date(Date.now() - 129600000).toLocaleDateString('ko-KR')
                }
            ]
        }
    ];
    
    questions = sampleQuestions;
    questionIdCounter = 4;
    saveQuestions();
}

// 질문 제출 처리
function handleQuestionSubmit(e) {
    e.preventDefault();
    
    const subject = document.getElementById('subjectSelect').value;
    const title = document.getElementById('questionTitle').value;
    const content = document.getElementById('questionContent').value;
    const author = document.getElementById('authorName').value;
    
    if (!subject || !title || !content || !author) {
        alert('모든 필드를 입력해주세요.');
        return;
    }
    
    const newQuestion = {
        id: questionIdCounter++,
        subject: subject,
        title: title,
        content: content,
        author: author,
        date: new Date().toLocaleDateString('ko-KR'),
        answers: []
    };
    
    questions.unshift(newQuestion); // 최신 질문을 맨 위에 추가
    saveQuestions();
    displayQuestions();
    
    // 폼 초기화
    e.target.reset();
    
    alert('질문이 성공적으로 등록되었습니다!');
}

// 질문 저장
function saveQuestions() {
    localStorage.setItem('questions', JSON.stringify(questions));
    localStorage.setItem('questionIdCounter', JSON.stringify(questionIdCounter));
}

// 질문 목록 표시
function displayQuestions(filteredQuestions = null) {
    const questionsList = document.getElementById('questionsList');
    if (!questionsList) return;
    
    const questionsToShow = filteredQuestions || questions;
    
    if (questionsToShow.length === 0) {
        questionsList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">등록된 질문이 없습니다.</p>';
        return;
    }
    
    questionsList.innerHTML = questionsToShow.map(question => `
        <div class="question-item">
            <div class="question-header" onclick="toggleQuestion(${question.id})" style="cursor: pointer;">
                <div class="question-header-content">
                    <div class="question-title">${question.title}</div>
                    <div class="question-meta-info">
                        <span class="question-subject">${question.subject}</span>
                        <span class="question-meta-details">
                            <i class="fas fa-user"></i> ${question.author} | 
                            <i class="fas fa-calendar"></i> ${question.date} | 
                            <i class="fas fa-comments"></i> 답변 ${question.answers.length}개
                        </span>
                    </div>
                </div>
                <div class="question-controls">
                    <i class="fas fa-chevron-down toggle-icon" id="toggle-icon-${question.id}"></i>
                    <button class="delete-btn" onclick="event.stopPropagation(); deleteQuestion(${question.id})" title="질문 삭제">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="question-details" id="question-details-${question.id}" style="display: none;">
                <div class="question-content">${question.content}</div>
                <div class="question-actions">
                    <button class="action-btn" onclick="toggleAnswers(${question.id})">
                        <i class="fas fa-eye"></i> 답변 보기
                    </button>
                    <button class="action-btn" onclick="showAnswerForm(${question.id})">
                        <i class="fas fa-reply"></i> 답변 작성
                    </button>
                </div>
                <div id="answers-${question.id}" class="answers-section" style="display: none;">
                    ${question.answers.length > 0 ? question.answers.map((answer, answerIndex) => `
                        <div class="answer-item">
                            <div class="answer-header">
                                <span class="answer-author">${answer.author}</span>
                                <div class="answer-actions">
                                    <span class="answer-date">${answer.date}</span>
                                    <button class="delete-answer-btn" onclick="deleteAnswer(${question.id}, ${answerIndex})" title="답변 삭제">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="answer-content">${answer.content}</div>
                        </div>
                    `).join('') : '<p style="color: #666; text-align: center;">아직 답변이 없습니다.</p>'}
                </div>
                <div id="answer-form-${question.id}" class="answer-form" style="display: none;">
                    <textarea placeholder="답변을 입력하세요..." id="answer-content-${question.id}"></textarea>
                    <input type="text" placeholder="이름을 입력하세요" id="answer-author-${question.id}">
                    <button onclick="submitAnswer(${question.id})">답변 등록</button>
                </div>
            </div>
        </div>
    `).join('');
}

// 질문 토글
function toggleQuestion(questionId) {
    const questionDetails = document.getElementById(`question-details-${questionId}`);
    const toggleIcon = document.getElementById(`toggle-icon-${questionId}`);
    
    if (questionDetails.style.display === 'none') {
        questionDetails.style.display = 'block';
        toggleIcon.className = 'fas fa-chevron-up toggle-icon';
    } else {
        questionDetails.style.display = 'none';
        toggleIcon.className = 'fas fa-chevron-down toggle-icon';
    }
}

// 답변 토글
function toggleAnswers(questionId) {
    const answersSection = document.getElementById(`answers-${questionId}`);
    if (answersSection.style.display === 'none') {
        answersSection.style.display = 'block';
    } else {
        answersSection.style.display = 'none';
    }
}

// 답변 폼 표시
function showAnswerForm(questionId) {
    const answerForm = document.getElementById(`answer-form-${questionId}`);
    if (answerForm.style.display === 'none') {
        answerForm.style.display = 'block';
    } else {
        answerForm.style.display = 'none';
    }
}

// 답변 제출
function submitAnswer(questionId) {
    const content = document.getElementById(`answer-content-${questionId}`).value;
    const author = document.getElementById(`answer-author-${questionId}`).value;
    
    if (!content || !author) {
        alert('답변 내용과 작성자를 입력해주세요.');
        return;
    }
    
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.answers.push({
            author: author,
            content: content,
            date: new Date().toLocaleDateString('ko-KR')
        });
        
        saveQuestions();
        displayQuestions();
        
        // 폼 초기화 및 숨기기
        document.getElementById(`answer-content-${questionId}`).value = '';
        document.getElementById(`answer-author-${questionId}`).value = '';
        document.getElementById(`answer-form-${questionId}`).style.display = 'none';
        
        alert('답변이 성공적으로 등록되었습니다!');
    }
}

// 질문 삭제
function deleteQuestion(questionId) {
    if (confirm('정말로 이 질문을 삭제하시겠습니까?\n질문과 모든 답변이 함께 삭제됩니다.')) {
        questions = questions.filter(question => question.id !== questionId);
        saveQuestions();
        displayQuestions();
        alert('질문이 삭제되었습니다.');
    }
}

// 답변 삭제
function deleteAnswer(questionId, answerIndex) {
    if (confirm('정말로 이 답변을 삭제하시겠습니까?')) {
        const question = questions.find(q => q.id === questionId);
        if (question && question.answers[answerIndex]) {
            question.answers.splice(answerIndex, 1);
            saveQuestions();
            displayQuestions();
            alert('답변이 삭제되었습니다.');
        }
    }
}

// 질문 필터링
function filterQuestions() {
    const filterValue = document.getElementById('filterSubject').value;
    
    if (!filterValue) {
        displayQuestions();
        return;
    }
    
    const filteredQuestions = questions.filter(question => question.subject === filterValue);
    displayQuestions(filteredQuestions);
}

// 페이지 로드 시 초기화
window.addEventListener('load', () => {
    initializeElements();
    
    // 기본 상태에서는 날씨 정보 영역을 숨기고 도시 검색 안내 표시
    if (weatherInfo) weatherInfo.style.display = 'none';
    if (error) error.style.display = 'none';
    if (loading) loading.style.display = 'none';
    
    // 현재 위치의 날씨 가져오기
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                console.log('위치 정보를 가져올 수 없습니다:', error);
                showError('위치 정보를 가져올 수 없습니다. 도시명을 입력해주세요.');
            }
        );
    } else {
        showError('브라우저가 위치 정보를 지원하지 않습니다. 도시명을 입력해주세요.');
    }
    
    // 질문 게시판 초기화
    initializeQuestionBoard();
});