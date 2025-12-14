#!/usr/bin/env python3
"""
Development server starter script for Sweet Shop Management System.
This script starts both the backend and frontend development servers.
"""

import subprocess
import sys
import os
import time
import signal
from pathlib import Path

def check_requirements():
    """Check if required tools are installed."""
    try:
        # Check Python
        result = subprocess.run(['python', '--version'], capture_output=True, text=True)
        print(f"✅ Python: {result.stdout.strip()}")
        
        # Check Node.js
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        print(f"✅ Node.js: {result.stdout.strip()}")
        
        # Check npm
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        print(f"✅ npm: {result.stdout.strip()}")
        
        return True
    except FileNotFoundError as e:
        print(f"❌ Missing requirement: {e}")
        return False

def setup_backend():
    """Setup backend dependencies."""
    print("\n🔧 Setting up backend...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found!")
        return False
    
    os.chdir(backend_dir)
    
    # Check if virtual environment exists
    venv_dir = Path("venv")
    if not venv_dir.exists():
        print("📦 Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"])
    
    # Install requirements
    if os.name == 'nt':  # Windows
        pip_path = "venv\\Scripts\\pip"
    else:  # Unix/Linux/macOS
        pip_path = "venv/bin/pip"
    
    print("📦 Installing backend dependencies...")
    subprocess.run([pip_path, "install", "-r", "requirements.txt"])
    
    os.chdir("..")
    return True

def setup_frontend():
    """Setup frontend dependencies."""
    print("\n🔧 Setting up frontend...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found!")
        return False
    
    os.chdir(frontend_dir)
    
    # Install npm dependencies
    print("📦 Installing frontend dependencies...")
    subprocess.run(["npm", "install"])
    
    os.chdir("..")
    return True

def start_servers():
    """Start both backend and frontend servers."""
    print("\n🚀 Starting development servers...")
    
    processes = []
    
    try:
        # Start backend
        print("🐍 Starting backend server...")
        os.chdir("backend")
        
        if os.name == 'nt':  # Windows
            python_path = "venv\\Scripts\\python"
        else:  # Unix/Linux/macOS
            python_path = "venv/bin/python"
        
        backend_process = subprocess.Popen([
            python_path, "-m", "uvicorn", "app.main:app", 
            "--reload", "--host", "0.0.0.0", "--port", "8000"
        ])
        processes.append(backend_process)
        
        os.chdir("..")
        time.sleep(2)  # Give backend time to start
        
        # Start frontend
        print("⚛️  Starting frontend server...")
        os.chdir("frontend")
        
        frontend_process = subprocess.Popen(["npm", "run", "dev"])
        processes.append(frontend_process)
        
        os.chdir("..")
        
        print("\n🎉 Development servers started!")
        print("📍 Backend:  http://localhost:8000")
        print("📍 Frontend: http://localhost:5173")
        print("📚 API Docs: http://localhost:8000/docs")
        print("\n⏹️  Press Ctrl+C to stop all servers")
        
        # Wait for processes
        for process in processes:
            process.wait()
            
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        for process in processes:
            process.terminate()
        print("✅ All servers stopped")

def main():
    """Main function."""
    print("🍬 Sweet Shop Development Server Starter")
    print("=" * 50)
    
    # Check requirements
    if not check_requirements():
        print("\n❌ Please install missing requirements and try again.")
        return
    
    # Setup backend
    if not setup_backend():
        print("\n❌ Backend setup failed!")
        return
    
    # Setup frontend
    if not setup_frontend():
        print("\n❌ Frontend setup failed!")
        return
    
    # Start servers
    start_servers()

if __name__ == "__main__":
    main()