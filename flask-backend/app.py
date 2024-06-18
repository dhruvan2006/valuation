from flask import Flask, request, send_file
from flask_cors import CORS

import yfinance as yf
import pandas as pd
import numpy as np

from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/api/optimal')
def home():
    return {"message": ":>"}, 200

@app.route('/api/optimal', methods=['POST'])
def tickers():
    data = request.json
    ticker = data.get('ticker', '')
    # TODO: add defaults
    start_date = data.get('start_date', '2023-01-01')
    end_date = data.get('end_date', '2030-01-01')
    upper_lev = data.get('upper_lev', 5)
    fees = data.get('fees', 0)

    # User didn't provide ticker
    if not ticker:
        return {"error": "Ticker not provided"}, 400
    
    try:
        df = yf.download(ticker, start_date, end_date)['Close']
        if df.empty:
            return {"error": "Invalid ticker"}, 400
    except Exception as e:
        return {"error": str(e)}, 500
    
    df['Delta'] = df.pct_change()
    mu = df['Delta'].mean()
    std = df['Delta'].std()

    k = np.linspace(0, upper_lev, 100)

    R = k*mu - 0.5*(k**2)*(std**2) / (1 + k*std)
    R_fees = R - fees / 365

    max_index = np.argmax(R)
    k_max = k[max_index]
    R_max = R[max_index]

    return {
        "k": k.tolist(),
        "R": R.tolist(),
        "R_fees": R_fees.tolist(),
        "k_max": k_max,
        "R_max": R_max,
        "mu": mu,
        "std": std
    }

@app.route('/api/optimal/pdf', methods=['GET'])
def download_pdf():
    try:
        return send_file('alpha-generation-and-risk-smoothing-using-managed-volatility.pdf', as_attachment=True)
    except Exception as e:
        return {"error": str(e)}, 500
