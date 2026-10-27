# ATHENA Laboratory — ver.CTRP

CTRP 연구실 홈페이지의 흰색 상단 내비게이션, 남색 첫 화면, 청록색 강조색과 연구 분야 중심 구성을 참고해 제작한 ATHENA 연구실 홈페이지입니다. 외부 라이브러리 없이 Python 3.11 이상으로 빌드합니다.

## 실행

이 폴더에서 다음을 실행합니다.

```powershell
python build.py
python verify.py
python -m http.server 4173 --bind 127.0.0.1 --directory dist
```

브라우저에서 http://127.0.0.1:4173/ 을 엽니다. 실행 파일 `preview.cmd`를 더블 클릭해도 됩니다. 종료는 실행 창에서 Ctrl+C를 누르세요.

`dist/index.html`을 파일로 직접 열면 절대 경로와 사이트 검색이 동작하지 않으므로 HTTP 서버를 사용합니다.

## 구성

- `build.py`: 새 디자인의 전체 사이트 생성기. 메인, 연구 이력, 프로젝트, 이벤트, 갤러리, 연락처를 구성합니다.
- `content.py`: 원본 ATHENA 저장소에서 가져온 논문·구성원·연구 본문 렌더러.
- `data/`: 원본 ATHENA의 TOML·CSV. 인물, 논문, 수상, 소식과 상세 페이지 설정입니다.
- `pages/research/`: 연구 분야 상세 설명. 그림은 `static/img/research/`입니다.
- `templates/base.html`: 모든 페이지의 공통 헤더, 메뉴, 검색, 푸터.
- `static/css/style.css`: 데스크톱·태블릿·모바일 스타일.
- `static/js/site.js`: 메뉴, 사이트 검색, 논문·구성원 필터, 사진 확대, SMR/MSR 개념도.
- `static/img/lab-life/`: 제공된 발표 자료에서 추출한 실제 연구실 활동 사진.
- `verify.py`: 내부 링크·그림·폰트·앵커·검색 인덱스와 논문 목록 누락 검사.
- `docs/SOURCES.md`: 출처와 자료가 다른 경우의 적용 기준.
- `dist/`: 빌드 결과. Git에서 제외하며 `python build.py`로 재생성합니다.

원본의 상세 페이지를 유지하고 연구 이력 페이지를 추가했습니다. 메인·연구 분야·인물·논문·수상·뉴스·프로젝트·이벤트·갤러리·연락처와 404 페이지를 제공합니다.

뉴스는 `data/news.toml`, 인물은 `data/people/*.toml`, 논문은 `data/journal.csv`, `data/conference.csv`를 수정한 뒤 다시 빌드하면 됩니다. CSV는 UTF-8로 저장하세요. 뉴스·인원·논문 건수는 빌드 시 목록에서 계산합니다. 갤러리·프로젝트·연구 이력은 `build.py`에 있습니다.

## 배포

완성된 `dist/` 폴더를 정적 호스팅에 올릴 수 있습니다. 이 저장소는 로컬 저장본으로 만들었으며 원격 저장소와 공개 배포는 설정하지 않았습니다.

GitHub Pages의 저장소 경로 아래에 배포할 때는 아래처럼 기준 경로를 설정한 후 빌드하세요.

```powershell
$env:SITE_BASE='/ver.CTRP'
python build.py
```

`.github/workflows/check.yml`은 push/PR 시 기본 경로의 빌드와 검사를 실행합니다. 실제 배포 동작은 포함하지 않습니다.

## 주요 기능

- 데스크톱 드롭다운과 모바일 접이식 내비게이션
- 전체 사이트 검색과 사이트맵
- 연도별 논문 펼치기, 저자·제목·연도 검색
- 구성원 이름·연구 관심 분야 검색
- 실제 연구실 사진 갤러리와 확대 보기
- SMR/MSR 열수력 개념도 전환과 애니메이션 일시정지
- 키보드 탐색, Escape로 대화상자 닫기, 동작 줄이기 설정 지원

첫 화면 그림은 열의 발생·제거와 자연순환을 설명하기 위한 개념도이며 실제 원자로 해석 결과를 표시하지 않습니다.
