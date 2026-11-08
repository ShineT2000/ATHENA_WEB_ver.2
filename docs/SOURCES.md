# 자료 출처 및 적용 기준

제작일: 2026-10-27

## 콘텐츠

1. https://github.com/ShineT2000/ATHENA-web
   - main 브랜치 공개 ZIP을 다운로드해 `data/`, `pages/`, `static/`을 가져왔습니다.
   - 확인 시 저장소 HEAD: `bf2854892bc86023f472c2773132060d2af97217`.
   - 인물 정보와 사진, 논문·학회·수상 목록, 뉴스, 연구 상세 설명, 주소와 전화번호를 사용했습니다.
   - `content.py`는 원본 `build.py`의 콘텐츠 렌더러를 재사용합니다. 새 사이트 빌드는 별도 `build.py`가 담당합니다.
2. `Introduction of research history in ATHENA Lab_2026.09.30.pptx`
   - 사용자가 제공한 로컬 발표 자료입니다. 원본 파일은 새 저장소에 복사하지 않았습니다.
   - 슬라이드 2: 연구실 15주년, 2011년 시작, 실험·해석 연구와 향후 방향.
   - 슬라이드 5–17: 2상 열전달, SMR 피동안전, 중대사고, AI, PMFR, 헬륨 버블링, 해양 MSR 연구 방향.
   - 슬라이드 16–17: 해양 운동·동결 밸브·MARS-100·용융염 누출과 고화 연구를 프로젝트 소개 및 Research 상세 페이지에 반영했습니다.
   - 슬라이드 20: 학회·교육·워크숍·모임 사진 8장을 추출해 갤러리에 사용했습니다.
   - 슬라이드 21: 교수 이메일을 확인했습니다.

### Research 업데이트 (2026-11-05)

2026-09-30 발표자료를 최신 제공 자료로 사용했습니다. 기존 네 연구 분야와 URL·기존 섹션 앵커를 유지하고, 메인 카드와 Research 목록 및 네 상세 페이지의 설명·그림을 갱신했습니다.

| 홈페이지 내용 | 발표자료 근거 | 새 이미지의 원본 미디어 |
| --- | --- | --- |
| 응축·비등·CHF·표면 개질·연료 피복관·안전주입 실험 | 슬라이드 5 | 기존 관련 실험 그림 유지 |
| 자연순환 SMR, 금속격납용기, FSS 실험시설 기획 | 슬라이드 7–8 | `image46.png` → `ismr-containment-experiment-2026.jpg` |
| 코드 검증, Wilks 방법, LHS 불확실도 평가 | 슬라이드 9 | `image68.jpeg`, `image63.png` → `safety-lhs-sampling-2026.jpg`, `safety-condensation-validation-2026.png` |
| MELCOR·MAAP·CINEMA, 수소 위험도, 사고관리 전략 | 슬라이드 6, 10 | 기존 코드·격납건물 그림 유지 |
| MAAP 대리모델 GUI, 72시간 압력 이력, 후보 전략별 안전여유 | 슬라이드 11 | `image90.png`, `image89.png`, `image92.png` → `ai-maap-*-2026.png` |
| PMFR 열수력-노물리 연계 해석 | 슬라이드 12–13 | `image106.png` → `pmfr-coupled-analysis-2026.png` |
| 불용성 핵분열생성물의 헬륨 부상 제거, 3상 MPS 해석 | 슬라이드 14 | `image115.png`, `image116.png` → `pmfr-fission-product-facility-2026.jpg`, `pmfr-bubble-particle-experiment-2026.png` |
| PCM 피동안전, 나선형 열교환기·1차 계통 최적화 | 슬라이드 15 | `image126.jpeg`, `image125.png` → `pmfr-helical-coil-design-2026.jpg`, `pmfr-design-tradeoff-2026.png` |
| 해양 운동에 따른 PMFR 반응도 및 동결밸브 거동 | 슬라이드 16 | `image132.png`, `image139.png` → `marine-pmfr-reactivity-2026.png`, `marine-freeze-valve-motion-2026.png` |
| MARS-100, 용융염 누출·퍼짐·고화 | 슬라이드 17 | `image147.png`, `image143.png`, `image149.png` → `marine-msr-spill-phenomena-2026.png`, `marine-msr-spill-temperature-2026.png`, `marine-mars100-concept-2026.png` |

원본 이미지는 종횡비와 그래프·라벨을 유지해 추출했으며, 웹 표시를 위해 긴 변을 최대 1,600px로 축소했습니다. 사진 두 장은 JPEG로 저장했습니다. 실험시설·해석 결과·GUI를 새로 생성하거나 결과값을 수정하지 않았습니다.

FSS 실험은 발표자료의 “in plan”을 따라 기획 단계로 기술했습니다. 슬라이드 11의 설계압력·안전여유 분류와 슬라이드 15–16의 그래프는 특정 예시 조건의 결과로 소개하며 일반적인 성능 보증으로 확대하지 않았습니다. 자료의 `MARK-KS` 표기는 기존 프로젝트에서 사용하는 `MARS-KS`와 구분이 불명확하므로 신규 본문에서는 해당 부분을 일반적인 system-code model로 기술했습니다. 기존 AI 시계열 예측 그림은 관련 선행연구임을 명시했습니다.

수정 전 소스와 빌드 결과 232개 파일은 프로젝트 바깥 `backups/athena-before-research-update-20261105-220701.zip`에 보관했습니다. 기준 커밋은 `ce32422d86d7ef9aea3390741389fe841d3d59b9`이며 GitHub 복원용 태그는 `research-before-20261105`입니다. ZIP 내부의 `BACKUP-MANIFEST.json`에 파일별 SHA-256을 기록했습니다. 원본 발표자료와 백업 ZIP은 공개 배포 대상에 포함하지 않았습니다.

## 디자인 참고

### 메인 화면 PMFR 애니메이션 (2026-11-05)

- 2026-11-08 사용자 요청에 따라 양측 나선형 열교환기를 외곽 하강 유로의 중심선으로 옮겼습니다. 하강 입자는 코일 내부 영역을 통과하고 열교환기 높이에서 고온색에서 저온색으로 바뀝니다. 뒤쪽 코일·유체 입자·앞쪽 코일 순으로 그려 코일이 하강 유로를 둘러싸는 관계를 표현했습니다.

- MSR 선택 시 표시하는 단면도는 `static/img/research/reactor-design-pmfr-1.png`의 PMFR 형상을 참고해 Canvas로 직접 구현했습니다. 금속 격납용기, 하부 액체연료 노심, 중앙 상승관, 나선형 열교환기, 외곽 하강부, 헬륨 주입부와 상부 가스 분리·배출 계통을 단순화했습니다.
- ATHENA 연구 소개: https://sites.google.com/hanyang.ac.kr/athena/research/smr-small-modular-reactor
- 자연순환 방향 참고: Juhyeong Lee et al., “Analysis of natural circulation characteristics of passive molten salt fast reactor by using OpenFOAM simulation,” KNS Spring Meeting, 2023. https://www.kns.org/files/pre_paper/49/23S-374-%EC%9D%B4%EC%A3%BC%ED%98%95.pdf
- 입자와 기포의 속도·크기, 색상과 구조물 비율은 설명을 위한 시각적 표현이며 수치해석 결과나 실제 설계 치수가 아닙니다.

https://ctrp.hanyang.ac.kr/

흰색 상단 메뉴, 짙은 남색의 소개 화면, 청록색 강조색, 연구 분야 카드, 구성원과 연구 실적 요약, 모집·연락처 구성을 참고했습니다. CTRP의 로고·문구·연구 데이터·중성자 애니메이션 코드는 복제하지 않았습니다. 첫 화면의 열수력 개념도와 전체 스타일은 새로 구현했습니다.

## 자료 간 차이

발표 자료의 2026-09-30 요약 수치(저널 64, 학회 190, 수상 20, 박사 10·석사 7·학부 3)와 저장소 목록의 개수가 다릅니다. 홈페이지에는 저장소의 전체 목록을 표시하고 건수를 자동 계산했습니다. 발표 자료의 수치를 합산하거나 현재 실적으로 중복 반영하지 않았습니다.

저장소 기준: 저널 85개, 학회 276개, 수상 29개. 대학원생 17명, 학부생 1명, 연구교수 2명, 졸업생 27명입니다. 이 수치는 제공된 목록 항목 수이며 이후 데이터 편집 시 자동 변경됩니다.

연구 이력은 발표 자료의 연구 단계 구분을 요약한 것입니다. 개별 과제의 정확한 착수일이나 향후 성과를 새로 주장하지 않습니다. 프로젝트 기간·참여 기관은 원본 뉴스의 명시된 값을 사용했습니다.
