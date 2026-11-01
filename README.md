<div align="center">
# 🧠 MindScope — Mental Health Score Prediction
 
**A machine learning web app that predicts a student's mental health score (out of 10) from their daily digital habits, lifestyle and stress level.**
 
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://mental-health-score-prediction-1-wtnx.onrender.com)
[![Dataset](https://img.shields.io/badge/Dataset-Kaggle-20BEFF?style=for-the-badge&logo=kaggle&logoColor=white)](https://www.kaggle.com/datasets/shivasingh4945/student-social-media-and-mental-health-impact)
 
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?logo=scikitlearn&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?logo=pandas&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
 
---
 
## 📌 Overview
 
**MindScope** is an end-to-end machine learning project. A trained regression model is served through a **FastAPI** backend and connected to a clean, responsive web interface. Users fill in a short "check-in" form about their habits, and the app returns a predicted **mental health score out of 10**.
 
The goal is to explore how everyday factors — screen time, phone unlocks, sleep, study hours, physical activity and stress — relate to student well-being.
 
---
 
## ✨ Features
 
- 🎯 **Instant predictions** — enter your details and get a score out of 10 in seconds
- 🧾 **Simple 3-step check-in form** — About you → Academic & digital habits → Lifestyle & stress
- ⚡ **FastAPI backend** with automatic request validation (Pydantic) and interactive API docs
- 🛡️ **Input validation** — ranges and allowed values enforced on every field
- 🌍 **Country grouping** — less common countries are grouped under "Other", matching how the model was trained
- 🎨 **Modern, responsive UI** built with HTML, CSS and vanilla JavaScript
- 🔓 **CORS enabled** so the frontend can communicate with the API
---
 
## 🖥️ Demo
 
🔗 **Live app:** https://mental-health-score-prediction-1-wtnx.onrender.com
 
<!-- Add a screenshot or GIF of your app here -->
<!-- ![App Screenshot](screenshots/app.png) -->
 
---
 
## 📊 Dataset
 
The model is trained on a publicly available dataset from Kaggle.
 
🔗 **Kaggle dataset:** [Student Social Media & Mental Health Impact](https://www.kaggle.com/datasets/shivasingh4945/student-social-media-and-mental-health-impact) — 5,000 student records (CSV). The raw file is not included in this repo; download it from Kaggle using the link above.
 
### Input features
 
| Feature | Description | Allowed values |
|---|---|---|
| `age` | Age of the student | 10 – 100 |
| `gender` | Gender | Male, Female |
| `country` | Country of residence | Any (rare ones grouped as "Other") |
| `academic_level` | Current academic level | High School, Undergraduate, Graduate |
| `most_used_platform` | Most-used social platform | Facebook, Instagram, Snapchat, Twitter, YouTube, TikTok, LinkedIn, LINE, KakaoTalk, VKontakte, WhatsApp, WeChat |
| `purpose_of_use` | Main purpose of use | Networking, Education, Entertainment, News |
| `avg_daily_usage_hours` | Average daily screen time (hrs) | 0 – 24 |
| `daily_unlocks` | Phone unlocks per day | ≥ 0 |
| `study_hours` | Study hours per day | 0 – 24 |
| `physical_activity_hours` | Physical activity per day (hrs) | 0 – 24 |
| `sleep_hours_per_night` | Sleep per night (hrs) | 0 – 24 |
| `stress_level` | Self-rated stress | Low, Medium, High, Very High |
 
### Target
 
| Target | Description |
|---|---|
| `Mental_Health_Score` | Predicted mental health score (rounded to 2 decimals, shown out of 10) |
 
---
 
## 🧠 Model
 
- **Task:** Regression (predicting a continuous mental health score)
- **Pipeline:** Data cleaning → feature engineering (country grouping) → encoding of categorical features → model training
- **Algorithm:** Random Forest Regressor (selected after comparing against a Linear Regression baseline)
- **Saved model:** `Mental_Health_Model.pkl` (loaded with `joblib`)
- **Full workflow:** see [`mental_health_score_prediction.ipynb`](mental_health_score_prediction.ipynb)
### Model performance
 
Three models were trained and compared on the same train/test split:
 
| Model | Test R² | Training R² | MAE | RMSE |
|---|---|---|---|---|
| Linear Regression | 0.7398 | 0.7237 | 0.5362 | 0.6760 |
| **Random Forest (default)** | **0.8776** | 0.9808 | **0.3472** | **0.4637** |
| Random Forest (tuned) | 0.8650 | 0.9547 | 0.3689 | 0.4869 |
 
**Key takeaways**
 
- 🌲 Random Forest clearly outperforms the Linear Regression baseline (test R² of ~0.88 vs ~0.74), which shows the relationship between habits and mental health score is non-linear.
- 📉 The best model predicts the score with an average error of only **~0.35 points** (MAE) on a 10-point scale.
- ⚖️ Hyperparameter tuning narrowed the gap between training and test R² (0.98 → 0.95 training), which reduces overfitting, at a small cost in test accuracy.
---
 
## 🏗️ Project Structure
 
```
Mental_Health_Score_Prediction/
│
├── main.py                                # FastAPI backend (API + model loading)
├── Mental_Health_Model.pkl                # Trained ML model
├── mental_health_score_prediction.ipynb   # EDA, preprocessing & model training
├── index.html                             # Frontend – structure
├── style.css                              # Frontend – styling
├── script.js                              # Frontend – form handling & API calls
├── requirements.txt                       # Python dependencies
└── .gitignore
```
 
---
 
## 🔌 API Reference
 
### `GET /`
Health check.
 
```json
{ "message": "Mental Health Score Predictor API is running" }
```
 
### `POST /predict`
Returns the predicted mental health score.
 
**Request body**
 
```json
{
  "age": 21,
  "gender": "Female",
  "country": "India",
  "academic_level": "Undergraduate",
  "most_used_platform": "Instagram",
  "purpose_of_use": "Entertainment",
  "avg_daily_usage_hours": 5.5,
  "daily_unlocks": 80,
  "study_hours": 4,
  "physical_activity_hours": 1,
  "sleep_hours_per_night": 7,
  "stress_level": "Medium"
}
```
 
**Response**
 
```json
{ "predicted_mental_health_score": 6.42 }
```
 
> Once the server is running, interactive Swagger docs are available at `/docs`.
 
---
 
## 🚀 Getting Started (Run Locally)
 
### 1. Clone the repository
 
```bash
git clone https://github.com/PriyaJha-14/Mental_Health_Score_Prediction.git
cd Mental_Health_Score_Prediction
```
 
### 2. Create a virtual environment (recommended)
 
```bash
python -m venv venv
source venv/bin/activate      # macOS / Linux
venv\Scripts\activate         # Windows
```
 
### 3. Install dependencies
 
```bash
pip install -r requirements.txt
```
 
### 4. Start the API
 
```bash
uvicorn main:app --reload
```
 
The API will be available at `http://127.0.0.1:8000` (docs at `http://127.0.0.1:8000/docs`).
 
### 5. Open the frontend
 
Open `index.html` in your browser (or serve it with a simple server such as `python -m http.server 5500`). Make sure the API URL in `script.js` points to your local server.
 
---
 
## 🛠️ Tech Stack
 
| Layer | Technologies |
|---|---|
| **Machine Learning** | Python, Pandas, NumPy, scikit-learn, Joblib |
| **Backend** | FastAPI, Pydantic, Uvicorn |
| **Frontend** | HTML5, CSS3, JavaScript |
| **Deployment** | Render |
| **Tools** | Jupyter Notebook, Git, GitHub |
 
---
 
## 👩‍💻 Author
 
**Priya Jha**
 
- GitHub: [@PriyaJha-14](https://github.com/PriyaJha-14)
---
 
## 🤝 Contributing
 
Suggestions and improvements are welcome! Feel free to open an issue or submit a pull request.
 
---
 
<div align="center">
⭐ If you found this project useful, please consider giving it a star!
 
*Designed for reflection, not diagnosis.*
 
</div>
