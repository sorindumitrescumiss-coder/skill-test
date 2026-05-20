'use client';

import React, { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { useSessionScreenRecording } from '@/app/skill-test/useSessionScreenRecording';
import type { User } from '@supabase/supabase-js';
import { FIELD_OPTIONS } from '@/app/skill-test/fieldOptions';
import { formatSkillPrice, getSkillTestAmountCentsForDifficulty } from '@/lib/stripe/pricing';
import { SkillFieldIcon } from '@/app/skill-test/SkillFieldIcon';

type MCQQuestion = { id: string; text: string; options: string[] };
type OpenQuestion = { id: string; text: string };
type PracticalQuestion = { id: string; text: string };

type Phase = 'idle' | 'loading' | 'test' | 'saving' | 'done' | 'error';
type SetupStep = 1 | 2 | 3 | 4 | 5;
type SetupPhase = 'intro' | 'wizard';
type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
type ActiveTestPart = 1 | 2 | 3 | 4 | 5;
type InterviewTurn = { questionId: string; question: string; answer: string; startedAt: string };
const LANGUAGE_OPTIONS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C#',
  'Go',
  'PHP',
  'C++',
  'Rust',
  'Kotlin',
  'Swift',
  'Ruby',
] as const;

const SUBTOPIC_HINTS: Record<string, Record<string, string>> = {
  'web-development': {
    Frontend:
      'HTML, CSS, JavaScript, TypeScript, React, Vue.js, Angular, Svelte, Next.js, Nuxt.js, Astro, HTMX, Alpine.js, jQuery, Bootstrap, Tailwind CSS',
    Backend:
      'Node.js, Express, Django, Flask, FastAPI, Ruby on Rails, Laravel, Spring Boot, ASP.NET Core, Go (Gin), Phoenix (Elixir), Actix (Rust)',
    Fullstack:
      'Next.js, Nuxt.js, Remix, SvelteKit, Astro, Meteor, RedwoodJS, Blitz.js, AdonisJS, NestJS, Laravel + Inertia, Django + React, Ruby on Rails + Hotwire, Spring Boot + React, MEAN, MERN, PERN, T3 Stack, JAMstack',
    Database:
      'PostgreSQL, MySQL, MongoDB, SQLite, Redis, Firebase Firestore, DynamoDB, Cassandra, MariaDB, Supabase, Prisma, Mongoose',
    'API & integration':
      'REST, GraphQL, tRPC, Apollo Server, Apollo Client, Postman, Swagger, Hasura, WebSocket, Socket.io, gRPC',
    'DevOps & deployment':
      'Docker, Kubernetes, GitHub Actions, GitLab CI, Jenkins, Vercel, Netlify, AWS, Heroku, Render, Nginx, Apache',
    Testing: 'Jest, Vitest, Cypress, Playwright, Mocha, Chai, React Testing Library, Puppeteer, Selenium, Postman (testing)',
    'State management': 'Redux, Zustand, Pinia, Vuex, MobX, Recoil, Jotai, Context API',
    'Build tools & bundlers': 'Webpack, Vite, Parcel, Rollup, esbuild, SWC, Babel',
    'Package managers': 'npm, Yarn, pnpm, bun',
    Security: 'Helmet.js, JWT, OAuth, Passport.js, Auth0, Clerk, NextAuth, bcrypt, CORS',
    'CMS(content management)': 'WordPress, Strapi, Sanity, Contentful, Ghost, Directus, Payload CMS',
    'Analytics & monitoring': 'Google Analytics, Sentry, LogRocket, Datadog, New Relic, Grafana, Prometheus',
  },
  ai: {
    'Data Processing & ETL': 'Pandas, NumPy, Polars, Dask, Apache Spark, Hadoop, SQL, Airflow',
    'Machine Learning (ML)': 'Scikit-learn, XGBoost, LightGBM, CatBoost, MLlib, Weka',
    'Deep Learning': 'TensorFlow, PyTorch, Keras, JAX, Caffe, MXNet, Theano',
    'Natural Language Processing (NLP)': 'Hugging Face Transformers, spaCy, NLTK, Gensim, BERT, GPT, LangChain, LlamaIndex',
    'Computer Vision (CV)': 'OpenCV, YOLO, Detectron2, MediaPipe, Pillow, CLIP, SAM (Segment Anything)',
    'Reinforcement Learning': 'Stable-Baselines3, RLlib, OpenAI Gym, DeepMind Lab, Ray RLlib',
    'MLOps & Deployment': 'MLflow, Kubeflow, TFX, SageMaker, Vertex AI, ONNX, BentoML, FastAPI (for serving)',
    AutoML: 'AutoGluon, H2O.ai, TPOT, AutoKeras, PyCaret',
    'Generative AI': 'LangChain, LlamaIndex, Stable Diffusion, DALL-E, Midjourney, ElevenLabs, Whisper',
    'Prompt Engineering': 'LangChain, PromptLayer, OpenAI API, Anthropic API, Cohere',
    'Model Optimization': 'TensorRT, OpenVINO, ONNX Runtime, Quantization (PyTorch), Pruning, Distillation',
    'Data Labeling': 'Labelbox, Prodigy, Supervisely, CVAT, Roboflow',
    'Explainable AI (XAI)': 'SHAP, LIME, Captum, Eli5, InterpretML',
  },
  'game-development': {
    'Game Engines': 'Unity, Unreal Engine, Godot, GameMaker, CryEngine, Lumberyard, Defold',
    '2D Game Development': 'Unity (2D), Godot (2D), GameMaker, Pygame, Construct, ClickTeam Fusion',
    '3D Game Development': 'Unreal Engine, Unity (3D), Godot (3D), CryEngine, Source Engine',
    'Game Design & Prototyping': 'Twine, Miro, Figma (game UI), InVision, Balsamiq',
    'Physics & Simulation': 'Box2D, Bullet Physics, NVIDIA PhysX, Havok, Unity Physics, Unreal Chaos',
    'Animation & Rigging': 'Blender, Maya, 3ds Max, Spine, DragonBones, Mixamo, Unity Animation',
    'Shaders & Visual Effects (VFX)': 'Shader Graph (Unity), Material Editor (Unreal), HLSL, GLSL, Niagara VFX',
    'Audio & Sound Design': 'FMOD, Wwise, Audacity, Reaper, Unity Audio, Unreal Audio Engine',
    'Game AI': 'Behavior Trees (Unreal/Unity), GOAP, Utility AI, ML-Agents (Unity), NavMesh',
    'Multiplayer & Networking': 'Mirror, Photon, Netcode for GameObjects, Unreal Replication, AWS GameLift',
    'Game Optimization': 'Profiler (Unity/Unreal), LOD, Occlusion Culling, Draw Call Batching, Memory Profiling',
    'Version Control for Games': 'Perforce Helix, Git LFS, Plastic SCM, Subversion',
    'Mobile Game Development': 'Unity (Mobile), Unreal (Mobile), Cocos2d, SpriteKit, LibGDX',
    'Game Testing & QA': 'TestComplete, Appium, Unity Test Framework, Selenium (web games), PlaytestCloud',
    'Game Monetization': 'Unity Ads, AdMob, IronSource, Adjust, Firebase (analytics), In-App Purchase SDKs',
  },
  blockchain: {
    'Smart Contract Development': 'Solidity, Vyper, Rust (Solana), Cairo (Starknet), Michelson (Tezos), Move (Aptos/Sui)',
    'Blockchain Platforms': 'Ethereum, Solana, Binance Smart Chain (BSC), Polygon, Avalanche, Polkadot, Cosmos, Near, Flow',
    'Frameworks & Tools': 'Hardhat, Truffle, Foundry, Remix IDE, Brownie, Ape Framework, Anchor (Solana)',
    'Web3 Libraries': 'Web3.js, Ethers.js, Solana Web3.js, Vecna, Thirdweb, Moralis',
    'Wallets & Authentication': 'MetaMask, WalletConnect, Phantom, Rainbow Kit, Web3Modal, Privy, Turnkey',
    'DeFi (Decentralized Finance)': 'Uniswap (v2/v3), Aave, Compound, Curve, Balancer, MakerDAO',
    'NFTs (Non-Fungible Tokens)': 'OpenZeppelin (ERC-721, ERC-1155), IPFS, Pinata, Rarible, Alchemy NFT API',
    'Layer 2 & Scaling': 'Optimism, Arbitrum, zkSync, Polygon zkEVM, Starknet, Base, Scroll',
    Oracles: 'Chainlink, Pyth Network, Band Protocol, API3, Chronicle',
    'Indexing & Query': 'The Graph (Subgraph), Blockfrost, Covalent, Dune Analytics, Nansen',
    'Security & Auditing': 'Slither, MythX, Echidna, Consensys Diligence, Trail of Bits, CertiK, Hacken',
    'Node Infrastructure': 'Alchemy, Infura, QuickNode, RPC Provider, Geth, OpenEthereum, Erigon',
    Stablecoins: 'USDC, USDT, DAI, FRAX (understanding mechanisms: over-collateralized + algorithmic)',
    'DAOs (Decentralized Autonomous Orgs)': 'Snapshot, Aragon, Syndicate, Tally, Juicebox',
    Cryptography: 'ECDSA, Ed25519, Keccak256, SHA-3, Merkle Trees, ZK Proofs (Circom + SnarkJS)',
  },
  architecture: {
    '2D Drafting & Documentation': 'AutoCAD, DraftSight, LibreCAD, nanoCAD, BricsCAD',
    '3D Modeling & Visualization': 'SketchUp, Rhino 3D, 3ds Max, Blender, ArchiCAD, Revit (Massing), FormIt',
    'BIM (Building Information Modeling)': 'Revit, ArchiCAD, Navisworks, BIM 360, Tekla Structures, Vectorworks, Allplan',
    'Rendering & Visualization': 'V-Ray, Lumion, Enscape, Twinmotion, Corona Renderer, KeyShot, Unreal Engine (Archviz)',
    'Structural Analysis': 'SAP2000, ETABS, STAAD.Pro, Tekla Structural Designer, Robot Structural Analysis, RISA',
    'Environmental Simulation': 'Ladybug Tools, EnergyPlus, IES VE, Ecotect, ClimateStudio, Fluent (CFD)',
    'Construction Management': 'Procore, Bluebeam Revu, PlanGrid, Buildertrend, CoConstruct, Autodesk Construction Cloud',
    'Urban Planning & GIS': 'ArcGIS, QGIS, CityEngine, AutoCAD Map 3D, Google Earth Pro, Mapbox',
    'Landscape Architecture': 'LandFX, Vectorworks Landmark, Realtime Landscaping Pro, SketchUp (Landscape)',
    'Interior Architecture': 'SketchUp, Revit (Interiors), 3ds Max (Interiors), Chief Architect, HomeByMe, RoomSketcher',
    'Computational Design': 'Grasshopper (Rhino), Dynamo (Revit), Python (for CAD), Processing',
    'Site Analysis & Surveying': 'AutoCAD Civil 3D, InfraWorks, Pix4D (drone mapping), DroneDeploy, Recap Pro',
    'Project Documentation': 'Bluebeam Revu, Adobe Acrobat Pro, Notion (specs), Confluence (team docs)',
    'Code Compliance': 'UpCodes, SmartBuildings, IBC (International Building Code) checkers, Local code databases',
    'Virtual Reality (Archviz VR)': 'Enscape VR, Twinmotion VR, Unreal Engine VR, Unity VR (for archviz), IrisVR',
  },
  art: {
    'Digital Painting & Illustration': 'Adobe Photoshop, Procreate, Clip Studio Paint, Krita, Corel Painter, Rebelle, PaintTool SAI, Affinity Photo',
    'Vector Art & Graphics': 'Adobe Illustrator, CorelDRAW, Inkscape, Affinity Designer, Figma (vector), Sketch, Vectr',
    'Concept Art': 'Photoshop, Procreate, Blender (for blockout), PureRef (mood boards), 3D-Coat',
    'Traditional Art (Digital Simulation)': 'Rebelle, ArtRage, Corel Painter, Krita (wet brushes)',
    'Pixel Art': 'Aseprite, Pyxel Edit, GraphicsGale, Piskel, Photoshop (pixel grid mode)',
    '3D Sculpting & Modeling': 'ZBrush, Blender (Sculpt Mode), Mudbox, 3DCoat, Nomad Sculpt (iPad)',
    'Texture & Material Creation': 'Substance Painter, Substance Designer, Quixel Mixer, ArmorPaint, Materialize',
    'Digital Collage & Mixed Media': 'Photoshop, Illustrator, Procreate, Canva, Affinity Suite',
    Typography: 'Adobe Fonts, Google Fonts, FontForge, Glyphs, FontLab, Calligraphr',
    'Color Theory Tools': 'Adobe Color, Coolors, Paletton, Color Hunt, Colormind',
    'Composition & Perspective Tools': 'Clip Studio (perspective rulers), Procreate (drawing guides), Blender (camera framing)',
    'Art Management & Portfolio': 'ArtStation, DeviantArt, Behance, Dribbble, Adobe Portfolio, Pixpa',
    'Printmaking (Digital)': 'GIMP (screen printing sim), Inkscape (linocut), Affinity Publisher (layout)',
    'Animation (2D Hand-drawn)': 'Toon Boom Harmony, TVPaint, Krita (animation), Clip Studio Paint (animation), RoughAnimator',
    'Generative Art': 'Processing, p5.js, TouchDesigner, openFrameworks, Python (Pillow, Matplotlib)',
  },
  marketing: {
    'Digital Marketing': 'Google Ads, Meta Ads (Facebook/Instagram), LinkedIn Ads, TikTok Ads, Twitter Ads, Pinterest Ads',
    'Search Engine Optimization (SEO)': 'Google Search Console, Ahrefs, SEMrush, Moz Pro, Screaming Frog, Yoast SEO, RankMath',
    'Content Marketing': 'WordPress, Medium, HubSpot, Substack, Ghost, Notion (content planning), Airtable',
    'Email Marketing': 'Mailchimp, Klaviyo, SendGrid, Constant Contact, ConvertKit, ActiveCampaign, Brevo (Sendinblue)',
    'Social Media Management': 'Hootsuite, Buffer, Later, Sprout Social, TweetDeck, Meta Business Suite, Agorapulse',
    'Marketing Analytics': 'Google Analytics, Adobe Analytics, Mixpanel, Amplitude, Heap, Tableau, Power BI',
    'Customer Relationship Management (CRM)': 'Salesforce, HubSpot CRM, Zoho CRM, Pipedrive, Monday.com, Freshsales, Dynamics 365',
    'Marketing Automation': 'HubSpot, Marketo, Pardot, ActiveCampaign, Mailchimp (automation), Klaviyo (flows)',
    'Influencer Marketing': 'AspireIQ, Upfluence, Grin, CreatorIQ, Tagger, Heepsy',
    'Affiliate Marketing': 'ShareASale, CJ Affiliate, Rakuten Advertising, Impact, PartnerStack, Awin',
    'Landing Page Builders': 'Unbounce, Instapage, Leadpages, ClickFunnels, Carrd, Webflow',
    'A/B Testing & Optimization': 'Google Optimize, Optimizely, VWO, AB Tasty, Convert',
    'Customer Feedback & Surveys': 'Typeform, SurveyMonkey, Google Forms, Hotjar, Qualtrics, Jotform',
    'Public Relations (PR)': 'Cision, Muck Rack, Meltwater, PRWeb, Newswire',
    'Brand Strategy Tools': 'Brand24 (monitoring), Mention (listening), Miro (brand workshops), Canva (brand kit)',
    'Marketing Project Management': 'Asana, Trello, Monday.com, ClickUp, Wrike, Basecamp, Notion',
    'Video Marketing': 'YouTube Studio (analytics), Wistia, Vimeo, Loom, Hippo Video',
    'SMS Marketing': 'Twilio, Klaviyo (SMS), Attentive, Postscript, TextMagic',
    'E-commerce Marketing': 'Shopify (marketing apps), WooCommerce, BigCommerce, Amazon Ads, eBay Ads, Etsy Ads',
    'Community Marketing': 'Discord, Circle, Slack (communities), Mighty Networks, Tribe',
  },
  multimedia: {
    'Video Editing': 'Adobe Premiere Pro, Final Cut Pro, DaVinci Resolve, CapCut, Vegas Pro, iMovie, Shotcut, Clipchamp',
    'Motion Graphics & VFX': 'Adobe After Effects, Apple Motion, Fusion (DaVinci), Natron, Cavalry, Rive',
    '3D Animation': 'Blender, Maya, 3ds Max, Cinema 4D, Houdini, LightWave 3D, Cascadeur',
    'Audio Editing & Mixing': 'Adobe Audition, Audacity, Reaper, Logic Pro, Pro Tools, FL Studio, Cubase, Ableton Live',
    'Sound Design': 'Audacity, Reaper, Sound Forge, Krotos, Boom Library (samples), Arturia (synths)',
    'Music Production': 'Ableton Live, FL Studio, Logic Pro, Cubase, Studio One, Reason, Bitwig, Reaper',
    Podcasting: 'Descript, Anchor (Spotify for Podcasters), Audacity, Riverside.fm, Zencastr, Cleanfeed',
    'Visual Effects (VFX)': 'After Effects, Nuke, Fusion, HitFilm, Blender (VFX), Blackmagic Fusion',
    'Color Grading': 'DaVinci Resolve, Baselight, FilmConvert, Color Finale, Premiere Pro (Lumetri)',
    'Screen Recording & Tutorials': 'OBS Studio, Camtasia, Loom, ScreenFlow, Bandicam, ShareX',
    'Broadcasting & Streaming': 'OBS Studio, vMix, Wirecast, Streamlabs, XSplit, Restream, StreamYard',
    'Interactive Multimedia': 'TouchDesigner, Max/MSP, Processing, p5.js, VVVV, Pure Data',
    'Virtual Reality (VR) Multimedia': 'Unity VR, Unreal Engine VR, Blender (VR scene prep), Adobe Aero, Oculus Medium',
    'Augmented Reality (AR)': 'Spark AR (Meta), Lens Studio (Snapchat), 8th Wall, Adobe Aero, Unity AR Foundation',
    '3D Scanning & Photogrammetry': 'RealityCapture, Meshroom, Metashape, Polycam, Trnio, 3D Zephyr',
    'Digital Signage': 'ScreenCloud, OptiSigns, NoviSign, Yodeck, Kitcast, PiSignage',
    'Subtitling & Captioning': 'Subtitle Edit, Aegisub, DaVinci Resolve (caption tool), Otter.ai, Rev',
    'Compression & Encoding': 'HandBrake, FFmpeg, Adobe Media Encoder, Shutter Encoder, Miro Video Converter',
    'Stock Media (for practice)': 'Pexels, Pixabay, Unsplash, Coverr, Mixkit, Artgrid, Epidemic Sound',
    'Thumbnail & YouTube Graphics': 'Canva, Photoshop, GIMP, Snappa, PicMonkey, Photopea',
  },
  'mobile-development': {
    'Native Android': 'Android Studio, Kotlin, Java, Jetpack Compose, XML layouts, Gradle, ADB, Room Database',
    'Native iOS': 'Xcode, Swift, SwiftUI, UIKit, Objective-C, Core Data, TestFlight, CocoaPods',
    'Cross-Platform (Framework)': 'Flutter, React Native, .NET MAUI, Xamarin, Kotlin Multiplatform, Ionic, Capacitor',
    'Mobile UI/UX Design': 'Figma (mobile), Sketch, Adobe XD, ProtoPie, Marvel, Flinto, Principle',
    'Mobile Backend & APIs': 'Firebase (Auth, Firestore, Cloud Functions), Supabase, AWS Amplify, Back4App, Parse',
    'Mobile Databases': 'SQLite, Realm, Firebase Firestore, ObjectBox, Couchbase Lite, Room (Android), Core Data (iOS)',
    'Mobile State Management': 'Redux (React Native), BLoC (Flutter), Riverpod, MobX, Provider, ViewModel (Android), Combine (iOS)',
    'Mobile Testing': 'Espresso (Android), XCTest (iOS), Appium, Detox, Maestro, Flutter Driver, BrowserStack',
    'Mobile CI/CD': 'Bitrise, GitHub Actions, Fastlane, CircleCI, Codemagic (Flutter), App Center, TestFlight',
    'Mobile Analytics & Crash Reporting': 'Firebase Analytics, Mixpanel, Amplitude, Sentry, Crashlytics, Instabug',
    'Mobile Push Notifications': 'Firebase Cloud Messaging (FCM), Apple Push Notification Service (APNs), OneSignal, Pusher',
    'Mobile Payments & Subscriptions': 'Stripe (Mobile SDK), RevenueCat, Google Play Billing, Apple App Store Connect, PayPal SDK',
    'Mobile App Distribution': 'Google Play Console, App Store Connect, TestFlight, Firebase App Distribution, Diawi, HockeyApp',
    'Mobile Performance Optimization': 'Android Profiler, Instruments (iOS), Flutter Performance, LeakCanary, Xcode Memory Graph',
    'Mobile Security': 'ProGuard (Android), DexGuard, Obfuscation, SSL Pinning, KeyStore (Android), Keychain (iOS), SafetyNet',
  },
  'desktop-applications': {
    'Cross-Platform Desktop': 'Electron, Tauri, Qt, .NET MAUI, Flutter (Desktop), JavaFX, wxWidgets, GTK, Avalonia UI',
    'Windows Native': '.NET Framework, WPF, WinForms, UWP, WinUI 3, C#, C++, MSIX, Windows API',
    'macOS Native': 'Swift, AppKit, SwiftUI, Objective-C, Xcode, Cocoa, Mac Catalyst, Sparkle (updates)',
    'Linux Native': 'GTK, Qt (Linux), Electron, Flutter (Linux), wxWidgets, Vala, AppImage, Flatpak, Snap',
    'Desktop UI Frameworks': 'Qt Widgets, QML, React (Electron), Vue (Electron), Tkinter, PyQt, Dear ImGui',
    'Desktop Databases': 'SQLite, SQL Server Express, PostgreSQL (local), DuckDB, H2 Database, Berkeley DB',
    'Desktop Testing': 'WinAppDriver, Appium (Desktop), AutoIt, Selenium (Electron), pytest (PyQt), NUnit',
    'Desktop Packaging & Installers': 'Inno Setup, NSIS, WiX Toolset, MSI, Electron Builder, Tauri Bundler, CreateDesktopShortcut',
    'Desktop Auto-Updates': 'Electron AutoUpdater, Sparkle (macOS), WinSparkle (Windows), Squirrel, Qt Installer Framework',
    'Desktop Performance': 'Visual Studio Profiler, Instruments (macOS), PerfView, Valgrind, VTune',
    'Desktop Security': 'Code Signing (DigiCert, Comodo), Obfuscation (ConfuserEx, Dotfuscator), Anti-Debugging, Secure Storage',
    'Legacy Desktop Migration': 'VB6 to .NET, Win32 to UWP, Delphi, PowerBuilder, FoxPro, Access to SQL Server',
  },
  'embedded-iot': {
    'Microcontrollers (MCUs)': 'Arduino, ESP32, ESP8266, STM32, PIC, AVR, MSP430, Raspberry Pi Pico (RP2040)',
    'Single Board Computers (SBCs)': 'Raspberry Pi, BeagleBone, NVIDIA Jetson, Orange Pi, Odroid, Asus Tinker Board',
    'Embedded Languages': 'C, C++, MicroPython, CircuitPython, Rust (embedded), Assembly (ARM, AVR), zig',
    'Embedded IDEs & Toolchains': 'Arduino IDE, PlatformIO, MPLAB X, STM32CubeIDE, Keil uVision, IAR Embedded Workbench, Eclipse',
    'Real-Time Operating Systems (RTOS)': 'FreeRTOS, Zephyr, VxWorks, ThreadX, Mbed OS, RIOT OS, QNX, uC/OS',
    'IoT Communication Protocols': 'MQTT, CoAP, HTTP/HTTPS (REST), WebSocket, LoRaWAN, Zigbee, Z-Wave, BLE, Modbus, CAN Bus',
    'IoT Cloud Platforms': 'AWS IoT Core, Azure IoT Hub, Google Cloud IoT, ThingSpeak, Particle, Blynk, Ubidots',
    'Embedded Linux': 'Yocto Project, Buildroot, OpenWrt, Raspbian, Ubuntu Core, BalenaOS, Petalinux',
    'Sensor Programming': 'I2C, SPI, UART, GPIO, ADC, PWM, Accelerometer, Gyroscope, Temperature (DHT22, DS18B20)',
    'Embedded Networking': 'Ethernet (TCP/IP stack), WiFi (ESP8266/ESP32), BLE (Bluetooth Low Energy), LoRa, LTE-M, NB-IoT',
    'Embedded Testing & Debugging': 'JTAG, SWD, GDB (Remote), Serial Monitor, Logic Analyzer (Saleae), Oscilloscope, printf debugging',
    'Firmware Over-the-Air (FOTA)': 'MQTT OTA, AWS OTA, Azure Device Update, Balena, JFrog Connect, Memfault',
    'Embedded Security': 'Secure Boot, TPM, Hardware Security Module (HSM), TrustZone (ARM), Secure Element (ATECC608A)',
    'Embedded Simulation': 'QEMU, Unicorn Engine, Wokwi, Tinkercad Circuits, Simulink (Embedded Coder)',
    'Embedded CI/CD': 'PlatformIO CI, GitHub Actions (Embedded), GitLab CI (for MCU), Jenkins (cross-compile)',
  },
  'devops-cloud': {
    Containerization: 'Docker, Podman, LXC, containerd, rkt, Buildah',
    'Container Orchestration': 'Kubernetes (k8s), Docker Swarm, Amazon ECS, Apache Mesos, Nomad, Rancher, OpenShift',
    'Infrastructure as Code (IaC)': 'Terraform, AWS CloudFormation, Pulumi, Ansible, Chef, Puppet, Bicep (Azure), CDK',
    'CI/CD Pipelines': 'GitHub Actions, GitLab CI, Jenkins, CircleCI, Azure DevOps, Bitbucket Pipelines, TeamCity, Bamboo',
    'Configuration Management': 'Ansible, Chef, Puppet, SaltStack, CFEngine',
    'Cloud Providers': 'AWS (Amazon Web Services), Microsoft Azure, Google Cloud Platform (GCP), DigitalOcean, Linode, Vultr',
    'Monitoring & Observability': 'Prometheus, Grafana, Datadog, New Relic, Nagios, Zabbix, Dynatrace, Sentry, Elastic Stack (ELK)',
    'Logging & Log Management': 'ELK Stack (Elasticsearch, Logstash, Kibana), Loki, Splunk, Fluentd, Graylog, Papertrail',
    'Secrets Management': 'HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, Google Secret Manager, Doppler, SOPS',
    'Service Mesh': 'Istio, Linkerd, Consul, Kuma, Traefik Mesh, Cilium',
    'API Gateway': 'Kong, NGINX, Traefik, AWS API Gateway, Azure API Management, Apigee, Envoy',
    'Load Balancing': 'NGINX, HAProxy, AWS ELB/ALB, Traefik, F5 Big-IP, Apache (mod_proxy_balancer)',
    'Infrastructure Monitoring': 'AWS CloudWatch, Azure Monitor, Google Cloud Monitoring, Prometheus, Datadog',
    'Cost Management': 'AWS Cost Explorer, CloudHealth (VMware), CloudCheckr, Kubecost, Vantage',
    'DevOps Scripting': 'Bash, Python, Go (for DevOps tools), Ruby (Chef/Puppet), Groovy (Jenkins)',
    'Serverless Frameworks': 'AWS Lambda, Serverless Framework, Azure Functions, Google Cloud Functions, Vercel, Netlify Functions',
    'Version Control (Git)': 'Git, GitHub, GitLab, Bitbucket, Azure Repos',
  },
  cybersecurity: {
    'Penetration Testing': 'Kali Linux, Metasploit, Burp Suite, OWASP ZAP, Nmap, SQLmap, Nikto, Wireshark, John the Ripper',
    'Vulnerability Scanning': 'Nessus, OpenVAS, Qualys, Nexpose, Acunetix, Intruder, Snyk, Trivy',
    'Network Security': 'Wireshark, tcpdump, Snort, Zeek (Bro), Suricata, pfSense, Cisco ASA, iptables, nftables',
    'Web Application Security': 'Burp Suite, OWASP ZAP, SQLmap, Nikto, Dirb, GoBuster, wpscan, Nuclei',
    'Cloud Security': 'AWS Security Hub, Azure Security Center, GCP Security Command Center, Prisma Cloud, Lacework, Wiz',
    'Security Information & Event Management (SIEM)': 'Splunk, Elastic SIEM, QRadar, LogRhythm, Azure Sentinel, Sumo Logic, Graylog',
    'Endpoint Detection & Response (EDR)': 'CrowdStrike Falcon, Carbon Black, SentinelOne, Microsoft Defender for Endpoint, Cylance',
    'Identity & Access Management (IAM)': 'Okta, Microsoft Entra ID (Azure AD), Auth0, Keycloak, Ping Identity, ForgeRock',
    'Encryption & Cryptography': 'OpenSSL, GnuPG (GPG), VeraCrypt, LUKS, HashCat, OpenSSL, age, cryptsetup',
    'Password Cracking': 'John the Ripper, HashCat, Hydra, Cain & Abel, L0phtCrack, CeWL (custom wordlist)',
    'Reverse Engineering': 'Ghidra, IDA Pro, Radare2, x64dbg, OllyDbg, dnSpy (.NET), gdb, objdump',
    Forensics: 'Autopsy (Sleuth Kit), FTK Imager, Volatility (memory forensics), RedLine, Wireshark (forensics)',
    'Container & Kubernetes Security': 'Docker Bench, kube-bench, kube-hunter, Falco, Trivy, Aqua Security',
    'DevSecOps & SAST/DAST': 'SonarQube, Checkmarx, Fortify, Snyk, OWASP Dependency-Check, Semgrep, Bandit (Python)',
    'Social Engineering': 'Gophish, SET (Social Engineering Toolkit), Evilginx2, Modlishka',
    'Wireless Security': 'Aircrack-ng, Kismet, Reaver, Wifite, BetterCAP, Bluetooth (Ubertooth)',
    'Red Teaming Tools': 'Cobalt Strike, Mythic, Covenant, Empire, Caldera, Atomic Red Team, BloodHound',
    'Blue Teaming / Defense': 'Snort, Suricata, Security Onion, Wazuh, OSSEC, Tripwire, SELinux, AppArmor',
  },
  'data-engineering': {
    'Data Warehousing': 'Snowflake, Amazon Redshift, Google BigQuery, Azure Synapse, Databricks SQL, Teradata',
    'ETL / ELT Pipelines': 'Apache Airflow, dbt (Data Build Tool), Apache NiFi, Talend, Informatica, Pentaho, Stitch',
    'Big Data Processing': 'Apache Spark, Apache Flink, Apache Hadoop (HDFS, MapReduce), Apache Beam, Dask, Ray',
    'Streaming Data': 'Apache Kafka, Apache Pulsar, Amazon Kinesis, RabbitMQ (streaming), Redpanda, Google Pub/Sub',
    'Data Lake & Storage': 'AWS S3, Azure Data Lake Storage (ADLS), Google Cloud Storage (GCS), HDFS, Delta Lake, Apache Iceberg',
    'Data Workflow Orchestration': 'Apache Airflow, Dagster, Prefect, Luigi, Argo Workflows, AWS Step Functions',
    'SQL Engines': 'PostgreSQL, Trino (Presto), Apache Drill, Spark SQL, Dremio, ClickHouse, DuckDB',
    'Data Transformation': 'dbt, Spark (DataFrame API), Pandas (for smaller data), SQL (CTEs, window functions)',
    'Data Quality & Validation': 'Great Expectations, Deequ, Soda SQL, dbt tests, Apache Griffin, Monte Carlo',
    'Data Cataloging & Governance': 'Apache Atlas, Amundsen, DataHub (LinkedIn), Collibra, Alation, Purview (Azure)',
    'Data Pipeline Monitoring': 'Datadog (data pipelines), Monte Carlo, Bigeye, Datafold, Elementary, Astronomer',
    'Data Modeling': 'dbt (semantic layer), LookML (Looker), Tableau (data modeling), ER/Studio, dbdiagram.io',
    'Reverse ETL': 'Hightouch, Census, Polytomic, Grouparoo, RudderStack (reverse ETL)',
    'Data Infrastructure as Code': 'Terraform (data pipelines), AWS CDK (for data), Pulumi, CloudFormation',
    'Data Version Control': 'DVC (Data Version Control), LakeFS, Git LFS (for data), Delta Lake (time travel)',
    'Data Engineering Languages': 'Python (PySpark, Pandas), SQL, Scala (Spark), Java (Kafka, Flink), Go (data pipelines)',
  },
  'product-design': {
    'UI Design': 'Figma, Sketch, Adobe XD, Framer, Lunacy, Penpot, InVision Studio, Axure RP',
    'UX Research & Testing': 'UserTesting, Maze, Lookback, Hotjar, Crazy Egg, Optimal Workshop, Dovetail, UserZoom',
    Wireframing: 'Balsamiq, Figma (wireframes), Sketch (low-fi), Wireframe.cc, Mockplus, Whimsical',
    Prototyping: 'Figma (prototype), InVision, ProtoPie, Framer, Axure RP, Marvel, Principle, Flinto',
    'Design Systems': 'Figma (components), Storybook (design + dev), Zeroheight, Supernova, Backlight',
    'User Flow & Journey Mapping': 'Miro, Mural, Lucidchart, Whimsical (flowcharts), UXPressia, Smaply, FlowMapp',
    'Handoff to Development': 'Zeplin, Figma Dev Mode, Avocode, InVision Inspect, Supernova (design tokens), Framer',
    'Accessibility (a11y) Tools': 'Stark (Figma/Sketch), Axe (Deque), Wave, Lighthouse (a11y), Color Contrast Analyzer',
    'User Persona & Empathy Mapping': 'Miro, Mural, Xtensio, Userforge, Smaply, UXPressia',
    'A/B Testing (Design)': 'Optimizely (visual editor), Google Optimize, VWO (visual editor), Unbounce',
    'Design Version Control': 'Figma version history, Abstract (Sketch), Plant, Kactus (design git)',
    'Collaborative Design': 'Figma (real-time), Miro, Whimsical, Conceptboard, Lucidspark',
    'Design Feedback Tools': 'InVision (comments), Zeplin (feedback), Pastel, BugHerd (visual feedback), Markly',
    'UI Animation Tools': 'Principle, Flinto, After Effects (with Lottie), Figma Smart Animate, Rive',
    'Design Documentation': 'Notion (design docs), Confluence, Zeroheight (design system docs), Slab, Nuclino',
  },
  'business-finance': {
    'Financial Modeling': 'Microsoft Excel (advanced), Google Sheets (complex formulas), Quantrix, Oracle Hyperion',
    'Accounting & Bookkeeping': 'QuickBooks, Xero, FreshBooks, Sage, Wave, Zoho Books, Odoo, NetSuite',
    'Enterprise Resource Planning (ERP)': 'SAP, Oracle ERP, Microsoft Dynamics 365, NetSuite, Odoo, Infor, Epicor',
    'Business Intelligence (BI)': 'Tableau, Power BI, Looker (Google), Qlik Sense, Domo, Metabase, Redash',
    'Budgeting & Forecasting': 'PlanGuru, Anaplan, Vena Solutions, Centage, Prophix, IBM Planning Analytics',
    'Invoicing & Payments': 'Stripe, PayPal, Square, FreshBooks (invoicing), Zoho Invoice, Wave, Xero (invoicing)',
    'Expense Management': 'Expensify, Concur (SAP), Rydoo, Brex, Divvy, Fyle, Spendesk',
    Payroll: 'Gusto, ADP, Paychex, BambooHR (payroll), QuickBooks Payroll, Rippling',
    'Financial Analysis & Ratios': 'Excel (financial functions), Python (Pandas, NumPy), R (tidyquant), MATLAB, QuantConnect',
    'Valuation & Investment': 'Bloomberg Terminal, Capital IQ, PitchBook, FactSet, Morningstar Direct, Yahoo Finance API',
    'Risk Management': 'RiskWatch, LogicManager, Palisade (Risk), SAS Risk Management, Active Risk Manager (ARM)',
    'Compliance & Regulatory': 'AuditBoard, NAVEX Global, LogicGate, ServiceNow GRC, MetricStream, OneTrust',
    'Project Finance': 'Oracle Primavera, Microsoft Project (finance module), Procore (finance), Aconex',
    'Treasury Management': 'Kyriba, Coupa (Treasury), GTreasury, TreasuryXpress, Bellin, Sage Intacct',
    'Revenue Management': 'Salesforce CPQ, Zuora (subscription), Maxio (formerly SaaSOptics), Chargebee',
    'Corporate Strategy Tools': 'Miro (strategy mapping), Strategyzer (Business Model Canvas), Cascade, BSC Designer',
    'Financial Dashboards': 'Tableau (Finance dashboards), Power BI (KPIs), Google Looker Studio, Klipfolio, Geckoboard',
    'Cryptocurrency & DeFi (Finance)': 'CoinGecko API, CoinMarketCap API, DeFi Llama, Dune Analytics (finance dashboards)',
  },
  photography: {
    'Photo Editing (Raw Processing)': 'Adobe Lightroom, Capture One, DxO PhotoLab, Luminar Neo, ON1 Photo RAW, Darktable (open source)',
    'Pixel-Level Editing & Retouching': 'Adobe Photoshop, Affinity Photo, GIMP, Pixelmator Pro, Corel PaintShop Pro, Photopea (browser)',
    'Batch Processing & Automation': 'Adobe Lightroom (batch), Photoshop Actions, Capture One (batch), FastStone Image Viewer',
    'RAW Conversion': 'Adobe Camera Raw (ACR), Capture One (RAW), DxO PureRAW, RawTherapee, Canon DPP, Nikon NX Studio',
    'Color Grading (Photos)': 'Adobe Lightroom (color grading), Capture One (color editor), DaVinci Resolve (for photo color)',
    'Noise Reduction': 'DxO DeepPRIME, Topaz DeNoise AI, Lightroom (AI Denoise), ON1 NoNoise AI, Neat Image',
    'Photo Composition & Cropping': 'Photoshop (crop tools), Lightroom (guided crop), GIMP, Affinity Photo, Figma (basic crop)',
    'HDR & Panorama Stitching': 'Adobe Lightroom (HDR/Pano), Photoshop (merge), PTGui, Hugin (open source), Affinity Photo',
    'Focus Stacking': 'Helicon Focus, Zerene Stacker, Photoshop (auto-blend layers), Affinity Photo',
    'Photo Management & DAM': 'Adobe Bridge, Lightroom (catalog), Photo Mechanic, DigiKam, Eagle, Mylio, Peakto',
    'Watermarking & Metadata': 'Lightroom (watermark), Photoshop (batch watermark), ExifTool, Photo Mechanic (metadata)',
    'Photo Retouching (Portrait)': 'Photoshop (liquify, frequency separation), PortraitPro, Luminar Neo (portrait), Evoto',
    'AI Photo Enhancement': 'Topaz Gigapixel (upscale), Topaz Photo AI, Luminar Neo (AI), Remini (face enhancement)',
    'Drone Photography': 'Adobe Lightroom (drone photos), DJI Fly (editing), DroneDeploy (mapping), Pix4Dcapture',
    'Product Photography': 'Photoshop (clipping paths, background removal), Capture One (color accuracy), Clipping Magic',
    'Photo Portfolio & Sharing': 'Adobe Portfolio, SmugMug, Zenfolio, Pixieset, Flickr, 500px, Format',
    'Time-Lapse Photography': 'LRTimelapse (editing), Lightroom (time-lapse sequence), After Effects (time-lapse assembly)',
  },
  'music-production': {
    'Digital Audio Workstations (DAWs)': 'Ableton Live, FL Studio, Logic Pro (macOS), Cubase, Pro Tools, Studio One, Reaper, Bitwig, Cakewalk, GarageBand',
    'Audio Recording (Studio)': 'Pro Tools (recording), Logic Pro (recording), Audacity, Reaper, Cubase, Studio One',
    'MIDI Sequencing': 'Ableton Live (MIDI), FL Studio (piano roll), Logic Pro (MIDI), Cubase (MIDI), Reaper (MIDI)',
    'Audio Editing & Comping': 'Pro Tools (Elastic Time), Logic Pro (Flex Time), Reaper (comping), Cubase (audio warp), Audacity',
    'Mixing & Balancing': 'Any DAW (built-in mixer), Pro Tools (mixing focus), Logic Pro (console emulation), Studio One (mix engine)',
    Mastering: 'iZotope Ozone, LANDR (AI mastering), Steinberg WaveLab, Ableton Live (master chain), Logic Pro (mastering tools)',
    'Virtual Instruments (VSTs)': 'Native Instruments (Kontakt, Massive), Serum (Xfer), Omnisphere, Sylenth1, Arturia (V Collection), Spitfire Audio',
    'Synthesizers (Software)': 'Serum, Massive X, Vital (free), Pigments (Arturia), Phase Plant, Diva (u-he)',
    'Sampling & Beat Making': 'Ableton (Simpler/Sampler), FL Studio (Sampler), Logic (Quick Sampler), MPC (software), Serato Sample',
    'Audio Effects (VST/AU)': 'iZotope (RX, Neutron), ValhallaDSP (reverb), Soundtoys (effects), FabFilter (EQ/comp), Waves (bundle)',
    'Drum Programming': 'FL Studio (step sequencer), Ableton (Drum Rack), Logic (Drummer), EZDrummer (realistic drums), Superior Drummer',
    'Audio Restoration & Repair': 'iZotope RX (audio repair), Adobe Audition (restoration), Audacity (noise reduction), Acon Digital Restoration',
    'Sound Design (From Scratch)': 'Serum (wavetable), Vital (free), Phase Plant, Massive X, Harmor (FL Studio), Zebra (u-he)',
    'Orchestral Composition': 'Spitfire Audio (BBC Symphony), EastWest (Hollywood Orchestra), Native Instruments (Symphony Series), NotePerformer',
    'Loop & Sample Management': 'Splice (sample finder), Loopcloud, ADSR Sample Manager, Native Instruments Battery (sample management)',
    'Music Notation & Scoring': 'Sibelius, Finale, Dorico, MuseScore (free), Noteflight (browser)',
    'Audio-to-MIDI Conversion': 'Ableton (audio to MIDI), Melodyne (DNA), Cubase (audio to MIDI), Logic (audio to MIDI)',
    'Live Performance Setup': 'Ableton Live (session view), MainStage (macOS), Bitwig (live), StageLight (usine)',
    'Podcast & Voiceover Editing': 'Audacity (voice), Adobe Audition (podcast), Descript (voice editing), Reaper (voiceover)',
    'Collaboration (Music)': 'Splice Studio, BandLab, Soundtrap (browser), Endlesss (jam), Sessionwire (pro tools collab)',
  },
};

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'Foundations, terminology, and guided reasoning.' },
  { value: 'intermediate', label: 'Intermediate', description: 'Typical role-ready tasks and trade-offs.' },
  { value: 'advanced', label: 'Advanced', description: 'Deeper patterns, edge cases, and speed.' },
  { value: 'expert', label: 'Expert', description: 'Architecture-level judgment and ambiguity.' },
  { value: 'master', label: 'Master', description: 'Frontier depth, critique, and synthesis.' },
];

const SETUP_STEPS = [
  { id: 1, label: 'Difficulty' },
  { id: 2, label: 'Field' },
  { id: 3, label: 'Subtopic' },
  { id: 4, label: 'Language' },
  { id: 5, label: 'Exam room' },
] as const;

/** Intro screen: user must confirm each rule before continuing to the setup wizard. */
const INTRO_RULE_CHECKLIST = [
  {
    id: 'own-work',
    text: 'Complete the test yourself. Do not copy from others or use unauthorized assistance.',
  },
  {
    id: 'browser-watermark',
    text: 'During the exam, copy/paste and common screenshot shortcuts are blocked in the browser, and a visible watermark ties the session to your account. This cannot stop separate devices (cameras) or OS-level capture — high-stakes programs may require a dedicated lockdown client or proctoring policy.',
  },
  {
    id: 'honest',
    text: 'Answer honestly. The goal is a fair measure of your skills.',
  },
  {
    id: 'no-refresh',
    text: 'Do not refresh or close the tab while submitting; wait until grading finishes.',
  },
  {
    id: 'language',
    text: 'Use the language you select for written answers when the test is in that language.',
  },
  {
    id: 'connection',
    text: 'Ensure a stable connection; connection loss may affect submission.',
  },
] as const;

/** Fixed session length for the full assessment (all parts). */
const SESSION_DURATION_MINUTES = 60;

function formatSessionDuration(minutes: number): string {
  if (minutes >= 60 && minutes % 60 === 0) {
    const h = minutes / 60;
    return h === 1 ? '1 hour' : `${h} hours`;
  }
  return `${minutes} minutes`;
}

const SESSION_DURATION_MS = SESSION_DURATION_MINUTES * 60 * 1000;

/** HH:MM:SS if ≥1h, else M:SS */
function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function SkillTestClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [setupPhase, setSetupPhase] = useState<SetupPhase>('intro');
  const [setupStep, setSetupStep] = useState<SetupStep>(1);
  const [introRulesAck, setIntroRulesAck] = useState<Record<string, boolean>>({});
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [presetLanguages, setPresetLanguages] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [phase, setPhase] = useState<Phase>('idle');
  const [err, setErr] = useState<string | null>(null);
  const [stripePaymentRequired, setStripePaymentRequired] = useState(false);
  const [examFeeLabel, setExamFeeLabel] = useState('$30');
  const [paymentCreditId, setPaymentCreditId] = useState<string | null>(null);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentStatusLoading, setPaymentStatusLoading] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([]);
  const [openQuestions, setOpenQuestions] = useState<OpenQuestion[]>([]);
  const [correctingQuestions, setCorrectingQuestions] = useState<OpenQuestion[]>([]);
  const [practicalQuestions, setPracticalQuestions] = useState<PracticalQuestion[]>([]);
  const [aiInterviewQuestions, setAiInterviewQuestions] = useState<OpenQuestion[]>([]);
  const [mcAnswers, setMcAnswers] = useState<Record<string, number>>({});
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({});
  const [correctingAnswers, setCorrectingAnswers] = useState<Record<string, string>>({});
  const [practicalAnswers, setPracticalAnswers] = useState<Record<string, string>>({});
  const [aiInterviewAnswers, setAiInterviewAnswers] = useState<Record<string, string>>({});
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewIndex, setInterviewIndex] = useState(0);
  const [interviewDraft, setInterviewDraft] = useState('');
  const [interviewTurns, setInterviewTurns] = useState<InterviewTurn[]>([]);
  const [speechListening, setSpeechListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [faceMissingCount, setFaceMissingCount] = useState(0);
  const [proctorStartedAt, setProctorStartedAt] = useState<string | null>(null);
  const [interviewNotice, setInterviewNotice] = useState<string | null>(null);
  /** Examiner is reading the question aloud (browser TTS). */
  const [interviewerSpeaking, setInterviewerSpeaking] = useState(false);
  /** After the question is read, automatically open the mic for your spoken answer. */
  const [autoAskAnswer, setAutoAskAnswer] = useState(true);
  const recognitionRef = useRef<unknown>(null);
  const interviewVideoRef = useRef<HTMLVideoElement | null>(null);
  const interviewStreamRef = useRef<MediaStream | null>(null);
  /** Synced with mic tracks when acquiring media so auto-listen does not run before state updates. */
  const interviewMicReadyRef = useRef(false);
  const faceScanTimerRef = useRef<number | null>(null);
  const [activeTestPart, setActiveTestPart] = useState<ActiveTestPart>(1);
  const [maxUnlockedPart, setMaxUnlockedPart] = useState<ActiveTestPart>(1);
  /** Part 1 MCQ: show one question at a time; advance after each answer. */
  const [mcqStepIndex, setMcqStepIndex] = useState(0);
  /** Part 2 written: one prompt at a time. */
  const [openStepIndex, setOpenStepIndex] = useState(0);
  /** Part 3 correcting: one item at a time. */
  const [correctingStepIndex, setCorrectingStepIndex] = useState(0);
  /** Part 4 practical: one challenge at a time. */
  const [practicalStepIndex, setPracticalStepIndex] = useState(0);
  const prevActivePartRef = React.useRef<ActiveTestPart>(activeTestPart);
  const sessionTimerIntervalRef = useRef<number | null>(null);
  const sessionDeadlineRef = useRef<number | null>(null);
  const sessionTimerAttemptRef = useRef<string | null>(null);
  const sessionAutoSubmitFiredRef = useRef<string | null>(null);
  const submitRef = useRef<() => Promise<void>>(async () => {});
  const submitBusyRef = useRef(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    feedback: string;
    eligibleNft: boolean;
  } | null>(null);
  const [claimStatus, setClaimStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [claimedCredentialId, setClaimedCredentialId] = useState<string | null>(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [sessionMark] = useState(() =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 8) : String(Date.now()),
  );

  const sessionRecording = useSessionScreenRecording({ attemptId });

  const allIntroRulesAcknowledged = React.useMemo(
    () => INTRO_RULE_CHECKLIST.every((r) => Boolean(introRulesAck[r.id])),
    [introRulesAck],
  );

  const totalTestParts: 5 = 5;
  const selectedFieldConfig = FIELD_OPTIONS.find((f) => f.id === selectedField);
  const currentSubtopicHints = selectedField ? SUBTOPIC_HINTS[selectedField] : undefined;
  const selectedSubtopic = selectedTopics[0] ?? null;
  const selectedSubtopicHint = selectedSubtopic ? currentSubtopicHints?.[selectedSubtopic] : undefined;
  const subtopicProgramOptions = React.useMemo(() => {
    if (!selectedSubtopicHint) return [];
    const items: string[] = [];
    let current = '';
    let depth = 0;
    for (const ch of selectedSubtopicHint) {
      if (ch === '(') depth += 1;
      if (ch === ')' && depth > 0) depth -= 1;
      if (ch === ',' && depth === 0) {
        const token = current.trim();
        if (token) items.push(token);
        current = '';
        continue;
      }
      current += ch;
    }
    const lastToken = current.trim();
    if (lastToken) items.push(lastToken);
    return items;
  }, [selectedSubtopicHint]);
  const languageChoices = React.useMemo(() => {
    const base = subtopicProgramOptions.length > 0 ? subtopicProgramOptions : [...LANGUAGE_OPTIONS];
    if (presetLanguages.length === 0) return base;
    return Array.from(new Set([...presetLanguages, ...base]));
  }, [subtopicProgramOptions, presetLanguages]);

  const part1Complete = React.useMemo(
    () => mcqQuestions.length > 0 && mcqQuestions.every((q) => mcAnswers[q.id] !== undefined),
    [mcqQuestions, mcAnswers],
  );

  const part2Complete = React.useMemo(
    () =>
      openQuestions.length > 0 &&
      openQuestions.every((q) => (openAnswers[q.id] ?? '').trim().length > 0),
    [openQuestions, openAnswers],
  );

  const part3Complete = React.useMemo(
    () =>
      correctingQuestions.length > 0 &&
      correctingQuestions.every((q) => (correctingAnswers[q.id] ?? '').trim().length > 0),
    [correctingQuestions, correctingAnswers],
  );

  const part4Complete = React.useMemo(
    () =>
      practicalQuestions.length > 0 &&
      practicalQuestions.every((q) => (practicalAnswers[q.id] ?? '').trim().length > 0),
    [practicalQuestions, practicalAnswers],
  );

  const interviewQuestions = React.useMemo(() => {
    const base = aiInterviewQuestions.slice(0, 5);
    if (base.length >= 5) return base;
    const fallback = [
      'Walk me through a project decision you made and why.',
      'What trade-off would you make to improve performance quickly?',
      'How would you debug an issue that appears only in production?',
      'How do you ensure your solution is secure and maintainable?',
      'If your first approach fails, what is your backup plan?',
    ];
    const expanded = [...base];
    for (let i = base.length; i < 5; i += 1) {
      expanded.push({ id: `interview-${i + 1}`, text: fallback[i] });
    }
    return expanded;
  }, [aiInterviewQuestions]);

  const part5Complete = React.useMemo(
    () =>
      interviewQuestions.length > 0 &&
      interviewQuestions.every((q) => (aiInterviewAnswers[q.id] ?? '').trim().length > 0),
    [interviewQuestions, aiInterviewAnswers],
  );

  const canSubmitForGrading = React.useMemo(() => {
    const sessionTimeUp = remainingSeconds !== null && remainingSeconds <= 0;
    const allPartsAnswered =
      interviewStarted &&
      part1Complete &&
      part2Complete &&
      part3Complete &&
      part4Complete &&
      part5Complete;
    return sessionTimeUp || allPartsAnswered;
  }, [
    remainingSeconds,
    interviewStarted,
    part1Complete,
    part2Complete,
    part3Complete,
    part4Complete,
    part5Complete,
  ]);

  /** Blocks copy/cut/paste during the exam (including from answer fields) to reduce question/answer exfiltration. */
  const preventExamClipboard = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const preventExamContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const preventExamDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const refreshUser = useCallback(() => {
    const sb = getSupabaseBrowser();
    void sb.auth
      .getUser()
      .then(({ data }) => {
        setUser(data.user ?? null);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  React.useEffect(() => {
    const dispose = sessionRecording.dispose;
    return () => dispose();
  }, [sessionRecording.dispose]);

  React.useEffect(() => {
    refreshUser();
    const sb = getSupabaseBrowser();
    const { data: sub } = sb.auth.onAuthStateChange(
      (
        _event: unknown,
        _session: unknown,
      ) => {
        void refreshUser();
      },
    );
    return () => sub.subscription.unsubscribe();
  }, [refreshUser]);

  /** Deep link from dashboard cards: /skill-test?field=web-development */
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('examroom') === '1' || params.get('autostart') === '1') return;
    const raw = params.get('field');
    if (!raw) return;
    const ok = FIELD_OPTIONS.some((f) => f.id === raw);
    if (!ok) return;
    setSelectedField(raw);
    setSetupPhase('wizard');
    setSetupStep(2);
  }, []);

  /** Best-effort: block common copy/paste/screenshot/print shortcuts only while the live exam is active (cannot stop OS tools or a physical camera). */
  React.useEffect(() => {
    if (phase !== 'test') return;
    const blockShortcuts = (ev: KeyboardEvent) => {
      const inTextArea = ev.target instanceof HTMLTextAreaElement;
      const keyLower = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;

      if (ev.key === 'PrintScreen') {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        return;
      }

      // macOS / Chromebook screenshot shortcuts (may be consumed by the OS before the page sees them)
      if (ev.shiftKey && (ev.metaKey || ev.ctrlKey)) {
        if (['3', '4', '5', 's'].includes(keyLower)) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          return;
        }
      }

      const mod = ev.ctrlKey || ev.metaKey;
      if (mod && ['c', 'v', 'x'].includes(keyLower)) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        return;
      }
      // Select-all only outside answer textareas (still allows selecting your answer to edit locally without copy)
      if (mod && keyLower === 'a' && !inTextArea) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        return;
      }
      // Print / Save page — reduces PDF/save exfil attempts from the browser
      if (mod && !ev.shiftKey && (keyLower === 'p' || keyLower === 's')) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
      }
    };
    window.addEventListener('keydown', blockShortcuts, true);
    return () => window.removeEventListener('keydown', blockShortcuts, true);
  }, [phase]);

  React.useEffect(() => {
    const w = window as unknown as {
      webkitSpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
      SpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
    };
    setSpeechSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  React.useEffect(() => {
    if (!interviewStarted || activeTestPart !== 5) return;
    const onVisibility = () => {
      if (document.hidden) setTabSwitchCount((c) => c + 1);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [interviewStarted, activeTestPart]);

  const stopInterviewMedia = useCallback(() => {
    if (faceScanTimerRef.current) {
      window.clearInterval(faceScanTimerRef.current);
      faceScanTimerRef.current = null;
    }
    const stream = interviewStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      interviewStreamRef.current = null;
    }
    if (interviewVideoRef.current) {
      interviewVideoRef.current.srcObject = null;
    }
    setCameraReady(false);
    setMicReady(false);
    interviewMicReadyRef.current = false;
  }, []);

  React.useEffect(() => {
    return () => stopInterviewMedia();
  }, [stopInterviewMedia]);

  const [interviewMediaPending, setInterviewMediaPending] = useState(false);

  const acquireInterviewMedia = useCallback(async () => {
    setInterviewMediaPending(true);
    interviewMicReadyRef.current = false;
    try {
      stopInterviewMedia();

      const win = window as unknown as {
        FaceDetector?: new () => { detect: (source: HTMLVideoElement) => Promise<unknown[]> };
      };

      const startFaceScanIfNeeded = (hasVideo: boolean) => {
        if (!hasVideo || !win.FaceDetector) return;
        const detector = new win.FaceDetector();
        faceScanTimerRef.current = window.setInterval(() => {
          const videoEl = interviewVideoRef.current;
          if (!videoEl || videoEl.readyState < 2) return;
          void detector
            .detect(videoEl)
            .then((faces) => {
              if (!faces || faces.length === 0) setFaceMissingCount((c) => c + 1);
            })
            .catch(() => undefined);
        }, 5000);
      };

      const applyStream = (stream: MediaStream) => {
        interviewStreamRef.current = stream;
        const hasVideo = stream.getVideoTracks().length > 0;
        const hasAudio = stream.getAudioTracks().length > 0;
        interviewMicReadyRef.current = hasAudio;
        setCameraReady(hasVideo);
        setMicReady(hasAudio);
        if (interviewVideoRef.current) {
          interviewVideoRef.current.srcObject = stream;
          void interviewVideoRef.current.play().catch(() => undefined);
        }
        startFaceScanIfNeeded(hasVideo);
      };

      /** Prefer microphone alone first so users are not forced through a camera+m mic prompt. */
      const tryMicThenCamera = async (): Promise<boolean> => {
        let audioStream: MediaStream;
        try {
          audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch {
          return false;
        }
        const combined = new MediaStream();
        audioStream.getAudioTracks().forEach((t) => combined.addTrack(t));
        try {
          const videoOnly = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
          videoOnly.getVideoTracks().forEach((t) => combined.addTrack(t));
          applyStream(combined);
          setInterviewNotice(null);
        } catch {
          applyStream(combined);
          setInterviewNotice(
            'Microphone is on. Camera preview is optional — if you allow it later, use Retry for video.',
          );
        }
        return true;
      };

      if (await tryMicThenCamera()) {
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        applyStream(stream);
        setInterviewNotice(null);
        return;
      } catch {
        /* fall through */
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        applyStream(stream);
        setInterviewNotice(
          'Camera was blocked or unavailable — using microphone only. You can still use spoken answers.',
        );
        return;
      } catch {
        /* fall through */
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
        applyStream(stream);
        setInterviewNotice(
          'Microphone was blocked or unavailable — only the camera preview is active. Allow the microphone and use Retry to answer by voice.',
        );
        return;
      } catch {
        /* complete failure */
      }

      setCameraReady(false);
      setMicReady(false);
      interviewMicReadyRef.current = false;
      setInterviewNotice(
        'Microphone access is needed to speak your answers. Click “Allow microphone” or “Retry”, then choose Allow in the browser prompt. You can also type your answer below if your mic cannot be enabled.',
      );
    } finally {
      setInterviewMediaPending(false);
    }
  }, [stopInterviewMedia]);

  const retryInterviewMedia = useCallback(() => {
    void acquireInterviewMedia();
  }, [acquireInterviewMedia]);

  const beginVoiceCapture = useCallback(() => {
    const w = window as unknown as {
      webkitSpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
      SpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setInterviewNotice('Speech recognition is not supported in this browser.');
      return;
    }
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0]?.transcript ?? '';
      }
      setInterviewDraft(transcript.trim());
    };
    const recWithError = rec as typeof rec & { onerror: ((event: Event) => void) | null };
    recWithError.onerror = (event: Event) => {
      const err = (event as unknown as { error?: string }).error;
      setSpeechListening(false);
      if (err === 'not-allowed' || err === 'service-not-allowed') {
        setInterviewNotice(
          'The browser blocked speech recognition from using the microphone. Allow microphone access for this site (address bar lock icon), then try again.',
        );
      } else if (err === 'audio-capture') {
        setInterviewNotice('No microphone was found or capture failed. Check your device settings.');
      } else if (err && err !== 'aborted' && err !== 'no-speech') {
        setInterviewNotice(`Voice capture failed (${err}). Try again or use Retry camera & microphone.`);
      }
    };
    rec.onend = () => setSpeechListening(false);
    recognitionRef.current = rec;
    setSpeechListening(true);
    try {
      rec.start();
    } catch {
      setInterviewNotice('Could not start voice capture. Check microphone permission and try again.');
      setSpeechListening(false);
    }
  }, []);

  const stopVoiceCapture = useCallback(() => {
    const rec = recognitionRef.current as
      | {
          stop: () => void;
        }
      | null;
    if (rec) rec.stop();
    setSpeechListening(false);
  }, []);

  const speakInterviewQuestion = useCallback((text: string, opts?: { onComplete?: () => void }) => {
    stopVoiceCapture();
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      opts?.onComplete?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setInterviewerSpeaking(true);
    utterance.onend = () => {
      setInterviewerSpeaking(false);
      opts?.onComplete?.();
    };
    utterance.onerror = () => {
      setInterviewerSpeaking(false);
      opts?.onComplete?.();
    };
    window.speechSynthesis.speak(utterance);
  }, [stopVoiceCapture]);

  const maybeAutoListenAfterQuestion = useCallback(() => {
    if (autoAskAnswer && speechSupported && interviewMicReadyRef.current) beginVoiceCapture();
  }, [autoAskAnswer, speechSupported, beginVoiceCapture]);

  const startInterviewSession = useCallback(async () => {
    setInterviewNotice(null);
    setProctorStartedAt(new Date().toISOString());
    setInterviewStarted(true);
    setInterviewIndex(0);
    setInterviewDraft('');
    setInterviewerSpeaking(false);

    await acquireInterviewMedia();

    const first = interviewQuestions[0]?.text;
    if (first) {
      speakInterviewQuestion(first, {
        onComplete: () => maybeAutoListenAfterQuestion(),
      });
    }
  }, [interviewQuestions, speakInterviewQuestion, maybeAutoListenAfterQuestion, acquireInterviewMedia]);

  const proctoringReport = React.useMemo(() => {
    const durationMin = proctorStartedAt
      ? Math.max(0, Math.round((Date.now() - new Date(proctorStartedAt).getTime()) / 60000))
      : 0;
    const risk = tabSwitchCount > 1 || faceMissingCount > 2 ? 'elevated' : 'normal';
    return `Interview proctoring summary: mic=${micReady ? 'on' : 'off'}, camera=${cameraReady ? 'on' : 'off'}, tab_switches=${tabSwitchCount}, face_missing_events=${faceMissingCount}, duration_min=${durationMin}, risk=${risk}.`;
  }, [cameraReady, micReady, tabSwitchCount, faceMissingCount, proctorStartedAt]);

  React.useEffect(() => {
    if (!selectedField) {
      setSelectedTopics([]);
      return;
    }
    const allowedTopics = new Set<string>(
      FIELD_OPTIONS.find((field) => field.id === selectedField)?.topics ?? [],
    );
    setSelectedTopics((prev) => prev.filter((topic) => allowedTopics.has(topic)));
  }, [selectedField]);

  React.useEffect(() => {
    setSelectedLanguages((prev) => prev.filter((language) => languageChoices.includes(language)));
  }, [languageChoices]);

  React.useEffect(() => {
    if (mcqQuestions.length === 0) return;
    setMcqStepIndex((i) => Math.min(Math.max(i, 0), mcqQuestions.length - 1));
  }, [mcqQuestions.length]);

  React.useEffect(() => {
    if (openQuestions.length === 0) return;
    setOpenStepIndex((i) => Math.min(Math.max(i, 0), openQuestions.length - 1));
  }, [openQuestions.length]);

  React.useEffect(() => {
    if (correctingQuestions.length === 0) return;
    setCorrectingStepIndex((i) => Math.min(Math.max(i, 0), correctingQuestions.length - 1));
  }, [correctingQuestions.length]);

  React.useEffect(() => {
    if (practicalQuestions.length === 0) return;
    setPracticalStepIndex((i) => Math.min(Math.max(i, 0), practicalQuestions.length - 1));
  }, [practicalQuestions.length]);

  React.useEffect(() => {
    const prev = prevActivePartRef.current;
    prevActivePartRef.current = activeTestPart;
    if (activeTestPart === 1 && mcqQuestions.length > 0 && prev !== 1) {
      const firstIncomplete = mcqQuestions.findIndex((qu) => mcAnswers[qu.id] === undefined);
      setMcqStepIndex(firstIncomplete === -1 ? mcqQuestions.length - 1 : firstIncomplete);
    }
    if (activeTestPart === 2 && openQuestions.length > 0 && prev !== 2) {
      const firstIncomplete = openQuestions.findIndex((qu) => (openAnswers[qu.id] ?? '').trim().length === 0);
      setOpenStepIndex(firstIncomplete === -1 ? openQuestions.length - 1 : firstIncomplete);
    }
    if (activeTestPart === 3 && correctingQuestions.length > 0 && prev !== 3) {
      const firstIncomplete = correctingQuestions.findIndex((qu) => (correctingAnswers[qu.id] ?? '').trim().length === 0);
      setCorrectingStepIndex(firstIncomplete === -1 ? correctingQuestions.length - 1 : firstIncomplete);
    }
    if (activeTestPart === 4 && practicalQuestions.length > 0 && prev !== 4) {
      const firstIncomplete = practicalQuestions.findIndex((qu) => (practicalAnswers[qu.id] ?? '').trim().length === 0);
      setPracticalStepIndex(firstIncomplete === -1 ? practicalQuestions.length - 1 : firstIncomplete);
    }
    // practicalAnswers / correctingAnswers / openAnswers / mcAnswers read when switching parts only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTestPart, mcqQuestions, openQuestions, correctingQuestions, practicalQuestions]);

  const refreshPaymentCredit = useCallback(async () => {
    setPaymentStatusLoading(true);
    try {
      const [configRes, creditsRes] = await Promise.all([
        fetch('/api/stripe/config'),
        fetch('/api/stripe/credits'),
      ]);
      const config = (await configRes.json().catch(() => ({}))) as {
        paymentRequired?: boolean;
        formattedPrice?: string;
      };
      setStripePaymentRequired(Boolean(config.paymentRequired));

      const credits = (await creditsRes.json().catch(() => ({}))) as {
        credit?: { id: string } | null;
        paymentRequired?: boolean;
      };
      if (credits.paymentRequired === false) {
        setPaymentCreditId('free');
        return;
      }
      setPaymentCreditId(credits.credit?.id ?? null);
    } catch {
      /* keep previous state */
    } finally {
      setPaymentStatusLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refreshPaymentCredit();
  }, [refreshPaymentCredit]);

  React.useEffect(() => {
    setExamFeeLabel(formatSkillPrice(getSkillTestAmountCentsForDifficulty(difficulty)));
  }, [difficulty]);

  React.useEffect(() => {
    if (setupStep !== 5) return;
    void refreshPaymentCredit();
  }, [setupStep, refreshPaymentCredit]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (!sessionId) return;
    void (async () => {
      await fetch('/api/stripe/verify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      await refreshPaymentCredit();
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete('session_id');
      window.history.replaceState({}, '', nextUrl.toString());
    })();
  }, [refreshPaymentCredit]);

  const beginCheckout = async () => {
    if (!selectedField || paymentBusy) return;
    setPaymentBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldId: selectedField, difficulty }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string; url?: string };
      if (!res.ok || !j.url) {
        setErr(j.error ?? 'Could not start checkout.');
        return;
      }
      window.location.href = j.url;
    } catch {
      setErr('Could not connect to payment service.');
    } finally {
      setPaymentBusy(false);
    }
  };

  const hasExamPaymentCredit =
    !stripePaymentRequired || paymentCreditId === 'free' || Boolean(paymentCreditId);

  const start = async (
    overrides?: {
      fieldId?: string;
      topics?: string[];
      languages?: string[];
    },
    opts?: { preserveActiveRecording?: boolean },
  ) => {
    const activeField = overrides?.fieldId ?? selectedField;
    const activeTopics = overrides?.topics ?? selectedTopics;
    const activeLanguages = overrides?.languages ?? selectedLanguages;
    if (!activeField) {
      setErr('Please choose a field.');
      return;
    }
    if (activeTopics.length === 0) {
      setErr('Please choose a subtopic.');
      return;
    }
    if (activeLanguages.length === 0) {
      setErr('Please choose at least one language.');
      return;
    }
    if (stripePaymentRequired && !hasExamPaymentCredit) {
      setErr(`Pay the exam fee (${examFeeLabel}) before entering the exam room.`);
      return;
    }
    if (!opts?.preserveActiveRecording) {
      sessionRecording.dispose();
    }
    setErr(null);
    setResult(null);
    setPhase('loading');
    const fieldLabel = FIELD_OPTIONS.find((field) => field.id === activeField)?.label ?? activeField;
    const topic = `${fieldLabel} | Languages: ${activeLanguages.join(', ')} | Subtopics: ${activeTopics.join(', ')}`;
    const contentFocus = `Field=${fieldLabel}, Languages=${activeLanguages.join(', ')}, Subtopics=${activeTopics.join(', ')}`;
    const res = await fetch('/api/skill-test/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        difficulty,
        contentFocus,
        paymentId:
          stripePaymentRequired && paymentCreditId && paymentCreditId !== 'free'
            ? paymentCreditId
            : undefined,
      }),
    });
    const j = (await res.json().catch(() => ({}))) as
      | {
          error?: string;
          attemptId?: string;
          mcq?: MCQQuestion[];
          openEnded?: OpenQuestion[];
          correctingMistakes?: OpenQuestion[];
          practical?: PracticalQuestion[] | PracticalQuestion;
          aiInterview?: OpenQuestion[];
        }
      | Record<string, unknown>;
    if (!res.ok) {
      setPhase('idle');
      const code = (j as { code?: string }).code;
      if (res.status === 402 || code === 'PAYMENT_REQUIRED') {
        setPaymentCreditId(null);
        void refreshPaymentCredit();
      }
      setErr(typeof j.error === 'string' ? j.error : 'Failed to start test');
      sessionRecording.dispose();
      return;
    }
    if (stripePaymentRequired && paymentCreditId && paymentCreditId !== 'free') {
      setPaymentCreditId(null);
    }
    setAttemptId((j as { attemptId: string }).attemptId);
    setMcqQuestions((j as { mcq: MCQQuestion[] }).mcq ?? []);
    setOpenQuestions((j as { openEnded: OpenQuestion[] }).openEnded ?? []);
    setCorrectingQuestions((j as { correctingMistakes?: OpenQuestion[] }).correctingMistakes ?? []);
    const practicalFromApi = (j as { practical?: PracticalQuestion[] | PracticalQuestion }).practical;
    setPracticalQuestions(Array.isArray(practicalFromApi) ? practicalFromApi : practicalFromApi ? [practicalFromApi] : []);
    setAiInterviewQuestions((j as { aiInterview?: OpenQuestion[] }).aiInterview ?? []);
    setMcAnswers({});
    setMcqStepIndex(0);
    setOpenStepIndex(0);
    setCorrectingStepIndex(0);
    setPracticalStepIndex(0);
    setOpenAnswers({});
    setCorrectingAnswers({});
    setPracticalAnswers({});
    setAiInterviewAnswers({});
    setInterviewStarted(false);
    setInterviewIndex(0);
    setInterviewDraft('');
    setInterviewTurns([]);
    setTabSwitchCount(0);
    setFaceMissingCount(0);
    setProctorStartedAt(null);
    setInterviewerSpeaking(false);
    stopVoiceCapture();
    stopInterviewMedia();
    setActiveTestPart(1);
    setMaxUnlockedPart(1);
    setPhase('test');
  };

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (phase !== 'idle') return;

    const params = new URLSearchParams(window.location.search);
    const wantsAutostart = params.get('autostart') === '1';
    const wantsExamRoom = params.get('examroom') === '1';
    if (!wantsAutostart && !wantsExamRoom) return;

    const fieldId = params.get('field');
    if (!fieldId) return;

    const fieldConfig = FIELD_OPTIONS.find((field) => field.id === fieldId);
    if (!fieldConfig) return;

    const langsRaw = params.get('langs');
    const deepLinkedLanguages = langsRaw
      ? langsRaw
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
    if (deepLinkedLanguages.length > 0) {
      setPresetLanguages(deepLinkedLanguages);
    }

    const defaultTopic = fieldConfig.topics[0];
    const defaultLanguage = LANGUAGE_OPTIONS[0];
    if (!defaultTopic || !defaultLanguage) return;

    const topics = selectedTopics.length > 0 ? selectedTopics : [defaultTopic];
    const languages = selectedLanguages.length > 0
      ? selectedLanguages
      : deepLinkedLanguages.length > 0
        ? deepLinkedLanguages
        : [defaultLanguage];

    if (selectedField !== fieldId || selectedTopics.length === 0 || selectedLanguages.length === 0) {
      setSelectedField(fieldId);
      setSelectedTopics(topics);
      setSelectedLanguages(languages);
      setSetupPhase('wizard');
      setSetupStep(wantsExamRoom ? 5 : 4);
      return;
    }

    if (wantsExamRoom) {
      setSetupPhase('wizard');
      setSetupStep(5);
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete('examroom');
      window.history.replaceState({}, '', nextUrl.toString());
      return;
    }

    void start({ fieldId, topics, languages });
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete('autostart');
    window.history.replaceState({}, '', nextUrl.toString());
  }, [phase, selectedField, selectedTopics, selectedLanguages]);

  const submit = async () => {
    if (!attemptId || submitBusyRef.current) return;
    submitBusyRef.current = true;
    setErr(null);
    try {
      let recordingBlob: Blob | null = null;
      try {
        recordingBlob = await sessionRecording.finalizeRecording();
      } catch {
        recordingBlob = null;
      }
      setPhase('saving');
      if (recordingBlob) {
        sessionRecording.uploadRecordingInBackground(recordingBlob);
      }
      const res = await fetch('/api/skill-test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          mcAnswers,
          openAnswers,
          correctingAnswers,
          practicalAnswers,
          aiInterviewAnswers,
          proctoringReport,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        error?: string;
        score?: number;
        passed?: boolean;
        feedback?: string;
        eligibleNft?: boolean;
      };
      if (!res.ok) {
        setPhase('test');
        setErr(j.error || 'Submit failed');
        submitBusyRef.current = false;
        return;
      }
      setResult({
        score: j.score ?? 0,
        passed: Boolean(j.passed),
        feedback: j.feedback ?? '',
        eligibleNft: Boolean(j.eligibleNft),
      });
      setPhase('done');
    } catch {
      setPhase('test');
      setErr('Submit failed');
      submitBusyRef.current = false;
    }
  };

  submitRef.current = submit;

  React.useEffect(() => {
    if (phase !== 'test' || !attemptId) {
      if (sessionTimerIntervalRef.current !== null) {
        window.clearInterval(sessionTimerIntervalRef.current);
        sessionTimerIntervalRef.current = null;
      }
      if (phase !== 'test') {
        setRemainingSeconds(null);
      }
      return;
    }

    if (sessionTimerAttemptRef.current !== attemptId) {
      sessionDeadlineRef.current = Date.now() + SESSION_DURATION_MS;
      sessionTimerAttemptRef.current = attemptId;
      sessionAutoSubmitFiredRef.current = null;
    }

    const deadline = sessionDeadlineRef.current ?? Date.now() + SESSION_DURATION_MS;

    const tick = () => {
      const sec = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemainingSeconds(sec);
      if (sec <= 0) {
        if (sessionTimerIntervalRef.current !== null) {
          window.clearInterval(sessionTimerIntervalRef.current);
          sessionTimerIntervalRef.current = null;
        }
        if (sessionAutoSubmitFiredRef.current !== attemptId) {
          sessionAutoSubmitFiredRef.current = attemptId;
          void submitRef.current();
        }
      }
    };

    tick();
    sessionTimerIntervalRef.current = window.setInterval(tick, 1000);
    return () => {
      if (sessionTimerIntervalRef.current !== null) {
        window.clearInterval(sessionTimerIntervalRef.current);
        sessionTimerIntervalRef.current = null;
      }
    };
  }, [phase, attemptId]);

  const claimCredential = async () => {
    if (!attemptId) {
      setClaimStatus('error');
      setClaimMessage('Missing attempt id. Please retake the test and try again.');
      return;
    }
    setClaimStatus('loading');
    setClaimMessage(null);
    const res = await fetch('/api/skill-test/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId }),
    });
    const j = (await res.json().catch(() => ({}))) as {
      error?: string;
      alreadyClaimed?: boolean;
      credentialId?: string;
      claimedAt?: string;
    };
    if (!res.ok) {
      setClaimStatus('error');
      setClaimMessage(j.error ?? 'Failed to claim credential.');
      return;
    }
    setClaimStatus('done');
    setAlreadyClaimed(Boolean(j.alreadyClaimed));
    setClaimedCredentialId(j.credentialId ?? null);
    setClaimMessage(
      j.alreadyClaimed
        ? `Certificate already claimed.${j.credentialId ? ` ID: ${j.credentialId}` : ''}`
        : `Certificate claimed successfully.${j.credentialId ? ` ID: ${j.credentialId}` : ''}`,
    );
  };

  const goToDashboard = () => {
    router.push('/dashboard');
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        if (window.location.pathname !== '/dashboard') {
          window.location.assign('/dashboard');
        }
      }, 250);
    }
  };

  if (authLoading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="w-full border-l-2 border-stone-400 bg-transparent py-4 pl-5 font-sans text-sm text-stone-700">
        <p className="mb-2 font-semibold text-ink">Sign in to take a graded skill test</p>
        <p className="mb-4 text-ink-soft">Your account is required so results can be stored securely in the database.</p>
        <Link href="/sign-up-login-screen" className="text-[#4f46e5] font-semibold hover:underline">
          Go to sign in / create account
        </Link>
      </div>
    );
  }

  if (phase === 'done' && result) {
    return (
      <div className="w-full space-y-3 border-l-2 border-[#1e293b]/35 bg-transparent py-4 pl-5 font-serif">
        <h2 className="font-serif text-lg font-semibold italic text-ink">Results</h2>
        <p className="font-sans text-ink-muted">
          <span className="text-[#4f46e5]">Score:</span> <strong>{result.score}</strong> / 100
        </p>
        <p className="font-sans">
          <span className="text-[#4f46e5]">Passed:</span>{' '}
          <strong className={result.passed ? 'text-emerald-600' : 'text-red-600'}>
            {result.passed ? 'Yes' : 'No'}
          </strong>
        </p>
        {result.eligibleNft && (
          <p className="text-sm text-stone-700">
            You passed this assessment and can claim your certificate now.
          </p>
        )}
        {result.passed && result.eligibleNft && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={claimCredential}
              disabled={claimStatus === 'loading' || (claimStatus === 'done' && alreadyClaimed)}
              className="rounded-md bg-parchment-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-parchment-900 disabled:opacity-60"
            >
              {claimStatus === 'loading' ? 'Claiming...' : claimStatus === 'done' && alreadyClaimed ? 'Already Claimed' : 'Claim Certificate'}
            </button>
            {claimMessage && (
              <p className={`text-sm ${claimStatus === 'error' ? 'text-red-700' : 'text-emerald-700'}`}>{claimMessage}</p>
            )}
            {claimedCredentialId && <p className="text-xs text-ink-soft">Credential ID: {claimedCredentialId}</p>}
            {claimStatus === 'done' && (
              <Link href="/certificates" className="inline-block text-xs font-semibold text-[#4f46e5] hover:underline">
                Go to Certificates page
              </Link>
            )}
          </div>
        )}
        <p className="text-sm leading-relaxed text-ink-muted">{result.feedback}</p>
        <button
          type="button"
          onClick={() => {
            setPhase('idle');
            setResult(null);
            setErr(null);
            setClaimStatus('idle');
            setClaimMessage(null);
            setClaimedCredentialId(null);
            setAlreadyClaimed(false);
            setSetupStep(1);
            setSetupPhase('intro');
            setActiveTestPart(1);
            setMaxUnlockedPart(1);
            setInterviewStarted(false);
            setInterviewIndex(0);
            setInterviewDraft('');
            setInterviewTurns([]);
            setTabSwitchCount(0);
            setFaceMissingCount(0);
            setProctorStartedAt(null);
            setInterviewerSpeaking(false);
            stopVoiceCapture();
            stopInterviewMedia();
            sessionRecording.dispose();
            setIntroRulesAck({});
            submitBusyRef.current = false;
            sessionDeadlineRef.current = null;
            sessionTimerAttemptRef.current = null;
            sessionAutoSubmitFiredRef.current = null;
          }}
          className="btn-primary mt-2"
        >
          New attempt
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col space-y-6 font-serif text-ink [&_button]:font-sans [&_button]:not-italic [&_input]:font-sans [&_textarea]:font-sans [&_label]:font-sans">
      {phase !== 'test' && phase !== 'saving' && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={goToDashboard}
            className="inline-flex items-center rounded-md border border-[#1e293b]/35 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft transition hover:border-[#4f46e5]/55 hover:text-ink"
          >
            Go to Dashboard
          </button>
        </div>
      )}
      {phase === 'idle' && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto pb-3 [-webkit-overflow-scrolling:touch]">
            {setupPhase === 'intro' ? (
              <div className="w-full border-0 bg-transparent p-0 shadow-none">
                <div className="mx-auto w-full max-w-none">
            <p className="text-xs font-sans font-semibold uppercase tracking-wide text-stone-600">Before you begin</p>
            <h2 className="mt-2 text-2xl font-semibold italic tracking-tight text-ink sm:text-3xl">Test details &amp; rules</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-muted">
              Read this overview once. After you continue, you will choose difficulty, field, language, and subtopics—then your
              personalized test will be generated.
            </p>

            <div className="mt-8 space-y-8">
              <section className="border-l-2 border-[#1e293b]/35 pl-5">
                <h3 className="text-lg font-semibold italic text-ink">What this test includes</h3>
                <ul className="mt-3 list-inside list-disc space-y-2 text-ink-muted marker:text-[#4f46e5]">
                  <li>
                    <strong className="font-semibold text-ink">Part 1 — Multiple choice (25):</strong> Select the best answer for each
                    question.
                  </li>
                  <li>
                    <strong className="font-semibold text-ink">Part 2 — Written (10):</strong> Write clear responses in your own words.
                  </li>
                  <li>
                    <strong className="font-semibold text-ink">Part 3 — Correcting mistakes (15):</strong> Identify issues and provide corrected versions.
                  </li>
                  <li>
                    <strong className="font-semibold text-ink">Part 4 — Practical challenges (2):</strong> Two deeper scenarios aligned with your
                    field.
                  </li>
                  <li>
                    <strong className="font-semibold text-ink">Part 5 — AI interview (5):</strong> Video-style rounds — questions spoken aloud, you answer on camera by voice (no on-screen text).
                  </li>
                </ul>
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                  Questions are generated by AI based on your difficulty, field, language, and selected subtopics. Your score combines
                  automatic grading (multiple choice) and AI evaluation (written parts).
                </p>
              </section>

              <section className="border-l-2 border-[#6366f1]/45 pl-5">
                <h3 className="text-lg font-semibold italic text-ink">Rules</h3>
                <p className="mt-2 font-sans text-sm text-ink-soft">
                  Read each rule and check the box beside it. You can continue to setup only after every rule is acknowledged.
                </p>
                <fieldset className="mt-4 space-y-3 border-0 p-0">
                  <legend className="sr-only">Acknowledge each rule</legend>
                  {INTRO_RULE_CHECKLIST.map((rule) => {
                    const checked = Boolean(introRulesAck[rule.id]);
                    return (
                      <label
                        key={rule.id}
                        className={`flex cursor-pointer gap-3 rounded-md border px-3 py-3 font-sans transition-colors sm:px-4 ${
                          checked
                            ? 'border-[#4f46e5]/55 bg-[#0f172a]/[0.05]'
                            : 'border-[#1e293b]/25 bg-transparent hover:border-[#4f46e5]/35 hover:bg-[#0f172a]/[0.03]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setIntroRulesAck((prev) => ({
                              ...prev,
                              [rule.id]: !prev[rule.id],
                            }))
                          }
                          className="mt-1 h-4 w-4 shrink-0 rounded border-[#1e293b]/55 text-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/40"
                        />
                        <span className="text-sm leading-relaxed text-ink-muted">{rule.text}</span>
                      </label>
                    );
                  })}
                </fieldset>
                {!allIntroRulesAcknowledged && (
                  <p className="mt-3 font-sans text-xs font-medium text-[#8b5e00]" role="status">
                    Confirm all rules above to unlock continue.
                  </p>
                )}
              </section>
            </div>
          </div>
              </div>
            ) : (
          <div className="w-full">
            <div className="w-full border-0 bg-transparent p-0 shadow-none sm:p-1">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,220px)_1fr]">
                <aside className="border-b border-[#1e293b]/25 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-8">
                  <h3 className="text-2xl font-semibold italic text-ink">Skill Test</h3>
                  <p className="mt-1 text-xl font-semibold text-stone-800">Step {setupStep} of {SETUP_STEPS.length}</p>
                  <div className="mt-6 space-y-4">
                    {SETUP_STEPS.map((step) => {
                      const isDone = setupStep > step.id;
                      const isCurrent = setupStep === step.id;
                      return (
                        <div key={step.id} className="flex items-center gap-3 font-sans text-sm font-semibold">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                              isDone
                                ? 'border-[#4f46e5] bg-[#4f46e5] text-white'
                                : isCurrent
                                  ? 'border-slate-900 bg-slate-900 text-white'
                                  : 'border-stone-300 bg-parchment-50 text-slate-500'
                            }`}
                          >
                            {isDone ? '✓' : step.id}
                          </div>
                          <span className={isCurrent ? 'font-sans font-semibold text-ink underline decoration-[#6366f1] underline-offset-4' : 'font-sans text-ink-soft'}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </aside>

                <div className="border-l-2 border-[#6366f1]/40 pl-6 lg:pr-0">
                  <p className="text-sm leading-7 text-ink-soft">
                    Complete this quick setup to generate a personalized AI skill test.
                  </p>

                  {setupStep === 1 && (
                    <div className="mt-7 space-y-5">
                      <h4 className="text-2xl font-semibold italic tracking-tight text-ink md:text-3xl">
                        Choose difficulty level
                      </h4>
                      <fieldset className="space-y-2 border-0 p-0">
                        <legend className="sr-only">Difficulty level</legend>
                        {DIFFICULTY_OPTIONS.map((opt) => {
                          const selected = difficulty === opt.value;
                          return (
                            <label
                              key={opt.value}
                              className={`flex cursor-pointer gap-4 rounded-sm border px-4 py-3.5 font-sans outline-none ring-offset-2 ring-offset-white transition-colors focus-within:ring-2 focus-within:ring-[#6366f1]/50 sm:items-center ${
                                selected
                                  ? 'border-[#4f46e5] bg-[#0f172a]/[0.06] shadow-[inset_3px_0_0_0_#4f46e5]'
                                  : 'border-[#1e293b]/30 bg-transparent hover:border-[#4f46e5]/45 hover:bg-[#0f172a]/[0.03]'
                              }`}
                            >
                              <input
                                type="radio"
                                name="difficulty"
                                value={opt.value}
                                checked={selected}
                                onChange={() => setDifficulty(opt.value)}
                                className="sr-only"
                              />
                              <span
                                className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border-2 sm:mt-0 ${
                                  selected ? 'border-[#4f46e5] bg-[#4f46e5]' : 'border-[#1e293b]/70 bg-parchment-50/90'
                                }`}
                                aria-hidden
                              >
                                {selected && (
                                  <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" aria-hidden>
                                    <path
                                      d="M2.5 6.5 L5 9 L9.5 3.5"
                                      stroke="currentColor"
                                      strokeWidth="1.8"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </span>
                              <span className="min-w-0 flex-1 text-left">
                                <span className="block text-sm font-semibold text-ink">{opt.label}</span>
                                <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{opt.description}</span>
                              </span>
                            </label>
                          );
                        })}
                      </fieldset>
                    </div>
                  )}

                  {setupStep === 2 && (
                    <div className="mt-7 space-y-5">
                      <div>
                        <h4 className="text-2xl font-semibold italic tracking-tight text-ink md:text-3xl">Choose your field</h4>
                        <p className="mt-2 max-w-2xl font-sans text-sm leading-relaxed text-ink-soft">
                          These domains match the tracks in{' '}
                          <Link
                            href="/learning-world"
                            className="font-semibold text-ink underline decoration-parchment-400 underline-offset-[3px] transition hover:decoration-parchment-800"
                          >
                            Learning World
                          </Link>
                          . Select the area to evaluate here; you&apos;ll pick a subtopic next.
                        </p>
                      </div>
                      <fieldset className="border-0 p-0">
                        <legend className="sr-only">Professional field</legend>
                        <div className="grid max-h-[min(520px,calc(100dvh-20rem))] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                          {FIELD_OPTIONS.map((field) => {
                            const selected = selectedField === field.id;
                            return (
                              <label
                                key={field.id}
                                className={`group flex cursor-pointer flex-col rounded-xl border px-3 py-3 font-sans shadow-sm outline-none ring-offset-2 ring-offset-white transition focus-within:ring-2 focus-within:ring-[#6366f1]/50 sm:px-3.5 sm:py-3.5 ${
                                  selected
                                    ? 'border-[#4f46e5] bg-[#0f172a]/[0.07] shadow-[0_2px_12px_rgba(15,23,42,0.08)]'
                                    : 'border-[#1e293b]/28 bg-parchment-50/50 hover:border-[#4f46e5]/55 hover:bg-[#0f172a]/[0.04]'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="field"
                                  value={field.id}
                                  checked={selected}
                                  onChange={() => setSelectedField(field.id)}
                                  className="sr-only"
                                />
                                <div className="flex items-start gap-2.5">
                                  <SkillFieldIcon fieldId={field.id} variant="picker" />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <span className="block text-[1rem] font-semibold leading-snug text-ink [overflow-wrap:anywhere]">
                                        {field.label}
                                      </span>
                                      <span
                                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                                          selected
                                            ? 'border-parchment-800 bg-parchment-800 shadow-[0_0_0_2px_rgba(255,248,235,0.88)]'
                                            : 'border-parchment-500/60 bg-parchment-100'
                                        }`}
                                        aria-hidden
                                      >
                                        {selected && (
                                          <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" aria-hidden>
                                            <path
                                              d="M2.5 6.5 L5 9 L9.5 3.5"
                                              stroke="currentColor"
                                              strokeWidth="1.8"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        )}
                                      </span>
                                    </div>
                                    <span className="mt-0.5 block text-xs leading-snug text-ink-soft">
                                      {field.topics.length} specialization options
                                    </span>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {field.topics.slice(0, 4).map((topic) => (
                                        <span
                                          key={`${field.id}-${topic}`}
                                          className="max-w-full truncate rounded bg-parchment-200/55 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-soft ring-1 ring-inset ring-parchment-300/45"
                                        >
                                          {topic}
                                        </span>
                                      ))}
                                      {field.topics.length > 4 ? (
                                        <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-ink-soft">
                                          +{field.topics.length - 4}
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                    </div>
                  )}

                  {setupStep === 3 && (
                    <div className="mt-7 space-y-4">
                      <h4 className="text-2xl font-semibold italic tracking-tight text-ink md:text-3xl">Choose a subtopic</h4>
                      <p className="text-sm leading-7 text-ink-soft">
                        Pick one specialization area in {selectedFieldConfig?.label ?? 'your selected field'}.
                      </p>
                      <div className="grid gap-2 md:max-h-[420px] md:overflow-y-auto md:pr-1">
                        {(FIELD_OPTIONS.find((f) => f.id === selectedField)?.topics ?? []).map((topic) => {
                          const checked = selectedTopics.includes(topic);
                          const hint = currentSubtopicHints?.[topic];
                          return (
                            <label key={topic} className="flex cursor-pointer items-start gap-2.5 rounded-sm border border-[#1e293b]/35 bg-transparent px-3 py-2 text-sm text-ink-muted hover:border-[#4f46e5]/55 hover:bg-[#0f172a]/[0.04]">
                              <input
                                type="radio"
                                name="selected-subtopic"
                                checked={checked}
                                onChange={(e) => {
                                  setSelectedTopics(e.target.checked ? [topic] : []);
                                }}
                                className="sr-only"
                              />
                              <span
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                                  checked
                                    ? 'border-parchment-800 bg-parchment-800 shadow-[0_0_0_2px_rgba(255,248,235,0.88)]'
                                    : 'border-parchment-500/60 bg-parchment-100'
                                }`}
                                aria-hidden
                              >
                                {checked && (
                                  <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" aria-hidden>
                                    <path
                                      d="M2.5 6.5 L5 9 L9.5 3.5"
                                      stroke="currentColor"
                                      strokeWidth="1.8"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold leading-snug text-ink">{topic}</span>
                                {hint && <span className="mt-1 block text-xs leading-relaxed text-ink-soft">{hint}</span>}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      {selectedSubtopic && selectedSubtopicHint && (
                        <div className="mt-3 overflow-hidden rounded-md border border-[#1e293b]/30 bg-[#0f172a]/[0.02]">
                          <div className="grid grid-cols-1 border-b border-[#1e293b]/25 bg-[#0f172a]/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-soft sm:grid-cols-[200px_1fr] sm:px-4">
                            <span>Role Category</span>
                            <span>Specific Programs / Tools</span>
                          </div>
                          <div className="grid grid-cols-1 gap-2 px-3 py-3 sm:grid-cols-[200px_1fr] sm:px-4">
                            <span className="text-sm font-semibold text-ink">{selectedSubtopic}</span>
                            <span className="text-sm leading-relaxed text-ink-muted">{selectedSubtopicHint}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {setupStep === 4 && (
                    <>
                      <div className="mt-7 space-y-5">
                        <h4 className="text-2xl font-semibold italic tracking-tight text-ink md:text-3xl">Choose programming language</h4>
                        {selectedSubtopic && subtopicProgramOptions.length > 0 && (
                          <p className="text-sm leading-7 text-ink-soft">
                            Based on <span className="font-semibold text-ink">{selectedSubtopic}</span>, choose one or more programs/tools.
                          </p>
                        )}
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          {languageChoices.map((language) => {
                            const selected = selectedLanguages.includes(language);
                            return (
                              <label
                                key={language}
                                className={`flex min-h-[2.5rem] cursor-pointer gap-2.5 rounded-sm border px-3 py-2 font-sans outline-none ring-offset-2 ring-offset-white transition-colors focus-within:ring-2 focus-within:ring-[#6366f1]/50 sm:items-center ${
                                  selected
                                    ? 'border-[#4f46e5] bg-[#0f172a]/[0.07] shadow-[inset_3px_0_0_0_#4f46e5]'
                                    : 'border-[#1e293b]/22 bg-parchment-50/85 hover:border-[#4f46e5]/42 hover:bg-[#0f172a]/[0.03]'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  name={`language-${language}`}
                                  value={language}
                                  checked={selected}
                                  onChange={(e) => {
                                    setSelectedLanguages((prev) =>
                                      e.target.checked
                                        ? prev.includes(language)
                                          ? prev
                                          : [...prev, language]
                                        : prev.filter((item) => item !== language),
                                    );
                                  }}
                                  className="sr-only"
                                />
                                <span
                                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors sm:mt-0 ${
                                    selected
                                      ? 'border-parchment-800 bg-parchment-800 shadow-[0_0_0_2px_rgba(255,248,235,0.88)]'
                                      : 'border-parchment-500/60 bg-parchment-100'
                                  }`}
                                  aria-hidden
                                >
                                  {selected && (
                                    <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" aria-hidden>
                                      <path
                                        d="M2.5 6.5 L5 9 L9.5 3.5"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  )}
                                </span>
                                <span className="min-w-0 flex-1 text-left text-sm font-semibold leading-snug text-ink">{language}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <div className="animate-flow-left-right mt-8 border-l-2 border-[#4f46e5]/40 pl-5 text-base leading-8 text-ink-muted">
                        <p>
                          Degrees don&apos;t prove skill - performance does.
                          <br />
                          We use AI-driven assessments to evaluate real abilities and issue blockchain-backed certifications you can
                          trust.
                        </p>
                        <p className="mt-3 text-lg font-bold text-stone-800">
                          Join a global network where your skills are tested, verified, and recognized.
                        </p>
                      </div>
                    </>
                  )}

                  {setupStep === 5 && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <h4 className="text-2xl font-semibold italic tracking-tight text-ink md:text-3xl">
                          Review and enter examination room
                        </h4>
                        <p className="mt-1.5 text-sm leading-6 text-ink-soft">
                          Confirm your selected setup and review the exam policy before starting questions.
                        </p>
                      </div>

                      <section className="rounded-md border border-[#1e293b]/35 bg-[#0f172a]/[0.03] p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Selected elements</p>
                        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                          <div className="rounded-sm border border-[#1e293b]/25 bg-parchment-50 px-3 py-1.5">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Difficulty</p>
                            <p className="mt-0.5 text-sm font-semibold text-ink">
                              {DIFFICULTY_OPTIONS.find((opt) => opt.value === difficulty)?.label ?? difficulty}
                            </p>
                          </div>
                          <div className="rounded-sm border border-[#1e293b]/25 bg-parchment-50 px-3 py-1.5">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Field</p>
                            <p className="mt-0.5 text-sm font-semibold text-ink">{selectedFieldConfig?.label ?? '-'}</p>
                          </div>
                          <div className="rounded-sm border border-[#1e293b]/25 bg-parchment-50 px-3 py-1.5">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Subtopic</p>
                            <p className="mt-0.5 text-sm font-semibold text-ink">{selectedSubtopic ?? '-'}</p>
                          </div>
                          <div className="rounded-sm border border-[#1e293b]/25 bg-parchment-50 px-3 py-1.5">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Languages</p>
                            <p className="mt-0.5 text-sm font-semibold text-ink">
                              {selectedLanguages.length > 0 ? selectedLanguages.join(', ') : '-'}
                            </p>
                          </div>
                          <div className="rounded-sm border border-[#1e293b]/25 bg-parchment-50 px-3 py-1.5 sm:col-span-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Session length</p>
                            <p className="mt-0.5 text-sm font-semibold text-ink">
                              {formatSessionDuration(SESSION_DURATION_MINUTES)}
                            </p>
                          </div>
                        </div>
                      </section>

                      {stripePaymentRequired ? (
                        <section className="rounded-md border border-[#1e293b]/45 bg-[#0f172a]/[0.04] p-4">
                          <h5 className="text-lg font-semibold italic text-ink">Exam fee</h5>
                          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                            Each attempt costs <strong className="text-ink">{examFeeLabel}</strong> (per track on the
                            dashboard). Payment is processed securely by Stripe.
                          </p>
                          {paymentStatusLoading ? (
                            <p className="mt-3 text-sm text-ink-soft">Checking payment status…</p>
                          ) : hasExamPaymentCredit ? (
                            <p className="mt-3 rounded-md border border-emerald-300/70 bg-emerald-50/90 px-3 py-2 text-sm font-medium text-emerald-900">
                              Payment confirmed — you can enter the exam room.
                            </p>
                          ) : (
                            <div className="mt-3 space-y-2">
                              <p className="text-sm text-amber-900">Pay before starting your timed session.</p>
                              <button
                                type="button"
                                onClick={() => void beginCheckout()}
                                disabled={paymentBusy}
                                className="inline-flex rounded-md border border-parchment-800 bg-parchment-800 px-4 py-2 text-sm font-semibold text-parchment-50 transition hover:bg-parchment-900 disabled:opacity-60"
                              >
                                {paymentBusy ? 'Redirecting to Stripe…' : `Pay ${examFeeLabel} with Stripe`}
                              </button>
                            </div>
                          )}
                        </section>
                      ) : null}

                      <section className="rounded-md border border-[#1e293b]/35 bg-transparent p-3">
                        <h5 className="text-lg font-semibold italic text-ink">Examination briefing</h5>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed text-ink-muted marker:text-[#4f46e5]">
                          <li>
                            <strong className="font-semibold text-ink">Allocated time:</strong>{' '}
                            {formatSessionDuration(SESSION_DURATION_MINUTES)} for the full assessment (all five parts).
                          </li>
                          <li>
                            <strong className="font-semibold text-ink">Grading regulations:</strong> MCQ is auto-scored and written/practical/interview parts are AI-evaluated with rubric checks.
                          </li>
                          <li>
                            <strong className="font-semibold text-ink">Rules to observe:</strong> complete independently, avoid tab switching, and keep the session stable until grading is complete.
                          </li>
                          <li>
                            <strong className="font-semibold text-ink">Examination method:</strong> 5 parts - MCQ, written answers, mistake correction, practical tasks, and AI interview.
                          </li>
                          <li>
                            <strong className="font-semibold text-ink">Session capture:</strong> After you click Enter exam room, your browser will prompt you to share this tab or your screen; recording then runs automatically for your attempt.
                          </li>
                        </ul>
                      </section>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
            )}
          {err && (
            <p className="mx-auto mb-2 max-w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </p>
          )}
          </div>

          <div className="sticky bottom-0 z-20 mt-auto shrink-0 -mx-4 border-t border-stone-400/40 bg-parchment-50/95 px-4 py-4 shadow-[0_-8px_24px_-12px_rgba(28,25,23,0.1)] backdrop-blur-md sm:-mx-6 sm:px-6">
            {setupPhase === 'intro' ? (
              <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  disabled={!allIntroRulesAcknowledged}
                  onClick={() => {
                    if (!allIntroRulesAcknowledged) return;
                    setErr(null);
                    setSetupPhase('wizard');
                    setSetupStep(1);
                  }}
                  title={
                    allIntroRulesAcknowledged ? undefined : 'Check the box next to each rule in the Rules section to continue.'
                  }
                  className="inline-flex w-full items-center justify-center rounded-lg bg-parchment-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-parchment-900 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
                >
                  Continue to setup
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="rounded-md border border-[#1e293b]/45 bg-transparent px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06]"
                  onClick={() => {
                    if (setupStep === 1) {
                      setErr(null);
                      setSetupPhase('intro');
                      return;
                    }
                    setSetupStep((prev) => (prev > 1 ? (prev - 1) as SetupStep : prev));
                  }}
                >
                  {setupStep === 1 ? '← Details & rules' : 'Back'}
                </button>
                <div className="flex items-center gap-2">
                  {SETUP_STEPS.map((step) => (
                    <span
                      key={step.id}
                      className={`h-2.5 w-2.5 rounded-full ${setupStep === step.id ? 'bg-[#4f46e5]' : 'bg-slate-300'}`}
                    />
                  ))}
                </div>
                {setupStep < 5 ? (
                  <button
                    type="button"
                    className="rounded-md bg-parchment-800 px-5 py-2 text-sm font-semibold text-white transition hover:bg-parchment-900"
                    onClick={() => {
                      if (setupStep === 2 && !selectedField) {
                        setErr('Please choose a field.');
                        return;
                      }
                      if (setupStep === 3 && selectedTopics.length === 0) {
                        setErr('Please choose a subtopic.');
                        return;
                      }
                      if (setupStep === 4 && selectedLanguages.length === 0) {
                        setErr('Please choose at least one language.');
                        return;
                      }
                      setErr(null);
                      setSetupStep((prev) => (prev < 5 ? (prev + 1) as SetupStep : prev));
                    }}
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={
                      stripePaymentRequired &&
                      (paymentStatusLoading || !hasExamPaymentCredit)
                    }
                    onClick={() => {
                      void (async () => {
                        setErr(null);
                        await sessionRecording.startRecording();
                        await start(undefined, { preserveActiveRecording: true });
                      })();
                    }}
                    className="rounded-md bg-parchment-800 px-5 py-2 text-sm font-semibold text-white transition hover:bg-parchment-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Enter exam room
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {phase === 'loading' && <p className="text-slate-600">Generating questions…</p>}

      {phase === 'test' && (
        <div
          className="skill-test-protected relative space-y-6 select-none print:hidden"
          onContextMenu={preventExamContextMenu}
          onCopy={preventExamClipboard}
          onCut={preventExamClipboard}
          onPaste={preventExamClipboard}
          onDragStart={preventExamDrag}
        >
          <div
            className="pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-3xl"
            aria-hidden
          >
            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage: `repeating-linear-gradient(-24deg, transparent, transparent 44px, rgba(92,64,51,0.45) 44px, rgba(92,64,51,0.45) 45px)`,
              }}
            />
            <p className="absolute left-1/2 top-1/2 w-[min(90vw,720px)] -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] text-center text-[11px] font-semibold tracking-wide text-stone-400/65 sm:text-xs">
              TrueAssess · {user.email ?? user.id?.slice(0, 8) ?? 'session'} · {sessionMark}
            </p>
            <p
              className="absolute left-1/2 top-[58%] w-[min(92vw,760px)] -translate-x-1/2 rotate-[14deg] text-center text-[10px] font-medium tracking-[0.2em] text-stone-400/45 sm:text-[11px]"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              CONFIDENTIAL SESSION · {attemptId?.slice(0, 8) ?? sessionMark}
            </p>
          </div>

          <div className="relative z-[2] space-y-6">
          {phase === 'test' && remainingSeconds !== null && (
            <div
              className={`rounded-xl border px-4 py-3 font-sans sm:flex sm:items-center sm:justify-between sm:gap-4 ${
                remainingSeconds <= 300
                  ? 'border-red-400/70 bg-red-50/95 shadow-sm'
                  : 'border-[#1e293b]/35 bg-parchment-150/90'
              }`}
              role="timer"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#4f46e5]">Session time remaining</p>
                <p className="mt-1 text-[11px] leading-snug text-ink-soft sm:text-xs">
                  When time runs out, your answers are submitted automatically for grading. Session limit:{' '}
                  {formatSessionDuration(SESSION_DURATION_MINUTES)}. Finish all parts before then if you can.
                </p>
              </div>
              <p
                className={`mt-2 shrink-0 tabular-nums text-2xl font-bold tracking-tight sm:mt-0 ${
                  remainingSeconds <= 300 ? 'text-red-800' : 'text-ink'
                }`}
              >
                {formatCountdown(remainingSeconds)}
              </p>
            </div>
          )}
          <div className="rounded-xl border border-[#1e293b]/35 bg-parchment-150/90 px-3 py-3 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-4">
            <div className="min-w-0 space-y-1">
              <p className="font-sans text-xs font-semibold uppercase tracking-wide text-[#4f46e5]">Session screen recording</p>
              <p className="font-sans text-[11px] leading-snug text-ink-soft sm:text-xs">
                Capture starts automatically when you enter the exam room (browser will ask you to share this tab or your screen). Upload runs in
                the background after you submit. Stop sharing from the browser when you finish if needed.
              </p>
              {sessionRecording.message && (
                <p
                  className={`font-sans text-[11px] sm:text-xs ${
                    sessionRecording.ui === 'error' ? 'text-red-700' : 'text-ink-muted'
                  }`}
                >
                  {sessionRecording.message}
                </p>
              )}
            </div>
            <div className="mt-2 flex shrink-0 flex-wrap items-center justify-end gap-2 sm:mt-0">
              {sessionRecording.isRecording ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300/80 bg-red-50 px-2.5 py-1 font-sans text-[11px] font-semibold uppercase tracking-wide text-red-800">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-600" aria-hidden />
                  Recording
                </span>
              ) : (
                <span className="font-sans text-[11px] font-medium text-ink-soft sm:text-xs">
                  {sessionRecording.ui === 'uploaded'
                    ? 'Saved'
                    : sessionRecording.ui === 'uploading'
                      ? 'Saving…'
                      : sessionRecording.ui === 'stopped'
                        ? 'Stopped'
                        : sessionRecording.ui === 'error'
                          ? 'No capture'
                          : 'Idle'}
                </span>
              )}
            </div>
          </div>

          <nav
            className="flex flex-nowrap items-center gap-2 border-0 border-b border-[#1e293b]/30 bg-transparent px-0 pb-4 pt-1 sm:gap-3"
            aria-label="Test parts"
          >
            <span className="shrink-0 text-xs font-sans font-semibold uppercase tracking-wide text-[#4f46e5]/85">
              Parts
            </span>
            <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden">
              {Array.from({ length: totalTestParts }, (_, i) => i + 1).map((p) => {
                const n = p as ActiveTestPart;
                const unlocked = n <= maxUnlockedPart;
                const active = activeTestPart === n;
                const subtitle =
                  n === 1 ? 'Multiple choice' : n === 2 ? 'Written' : n === 3 ? 'Correcting mistakes' : n === 4 ? 'Practical' : 'AI interview';
                return (
                  <button
                    key={p}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => setActiveTestPart(n)}
                    title={`Part ${p}: ${subtitle}`}
                    className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 ${
                      active
                        ? 'bg-gradient-to-r from-[#1e293b] to-[#a07856] text-white shadow-sm'
                        : unlocked
                          ? 'border border-[#1e293b]/40 bg-transparent text-ink hover:border-[#4f46e5]/60 hover:bg-[#0f172a]/[0.04]'
                          : 'cursor-not-allowed border border-[#1e293b]/20 bg-transparent/30 text-ink-soft'
                    }`}
                  >
                    <span className="sm:hidden">P{p}</span>
                    <span className="hidden sm:inline">
                      Part {p}: {subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={goToDashboard}
              title="Go to Dashboard"
              className="ml-1 shrink-0 inline-flex items-center rounded-md border border-[#1e293b]/35 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft transition hover:border-[#4f46e5]/55 hover:text-ink sm:ml-2 sm:px-3 sm:text-xs"
            >
              Dashboard
            </button>
          </nav>

          {activeTestPart === 1 && (
          <section className="space-y-8 border-0 bg-transparent p-0 pt-2 shadow-none">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-serif text-xl font-semibold italic text-ink md:text-2xl">
                Part 1: Multiple-choice ({mcqQuestions.length || '…'})
              </h3>
              <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-sans font-semibold text-stone-800">
                Auto-checkable
              </span>
            </div>
            {mcqQuestions.length > 0 && mcqQuestions[mcqStepIndex] && (
              <>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 font-sans text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <span>
                    Question {mcqStepIndex + 1} of {mcqQuestions.length}
                  </span>
                  {part1Complete && (
                    <span className="rounded-full border border-emerald-300/60 bg-emerald-50 px-2 py-0.5 text-emerald-800">
                      Section complete
                    </span>
                  )}
                </div>
                <div
                  key={mcqQuestions[mcqStepIndex].id}
                  className="animate-slide-up rounded-xl border border-[#1e293b]/35 bg-parchment-200/95 p-4 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.42)] sm:p-5"
                >
                  <p className="font-serif text-lg font-semibold text-ink">Question {mcqStepIndex + 1}</p>
                  <p className="mt-2 select-none font-serif text-base leading-8 text-ink-muted">
                    {mcqQuestions[mcqStepIndex].text}
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    {mcqQuestions[mcqStepIndex].options.map((opt, optIdx) => (
                      <label
                        key={`${mcqQuestions[mcqStepIndex].id}-${optIdx}`}
                        className="flex cursor-pointer items-start gap-2 rounded-sm border border-[#1e293b]/40 bg-parchment-950/[0.05] px-3 py-2.5 font-serif text-sm leading-snug text-ink-muted transition hover:border-[#4f46e5]/60 hover:bg-[#0f172a]/[0.07] sm:text-base sm:leading-snug"
                      >
                        <input
                          type="radio"
                          name={mcqQuestions[mcqStepIndex].id}
                          checked={mcAnswers[mcqQuestions[mcqStepIndex].id] === optIdx}
                          onChange={() => {
                            const q = mcqQuestions[mcqStepIndex];
                            setMcAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                            const idx = mcqStepIndex;
                            if (idx < mcqQuestions.length - 1) {
                              window.setTimeout(() => setMcqStepIndex(idx + 1), 400);
                            }
                          }}
                          className="mt-1 h-4 w-4 shrink-0 border-slate-400 text-stone-700 focus:ring-stone-400"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="mr-2 inline-block font-sans text-xs font-semibold tabular-nums text-stone-500">
                            {optIdx + 1}.
                          </span>
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    disabled={mcqStepIndex === 0}
                    onClick={() => setMcqStepIndex((i) => Math.max(0, i - 1))}
                    className="rounded-md border border-[#1e293b]/45 bg-transparent px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Previous question
                  </button>
                </div>
              </>
            )}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#1e293b]/25 pt-6">
              <p className="mr-auto font-sans text-sm text-ink-soft">
                {part1Complete
                  ? 'All multiple-choice questions answered. Continue when ready.'
                  : 'Choose an answer — the next question appears automatically.'}
              </p>
              <button
                type="button"
                disabled={!part1Complete}
                onClick={() => {
                  setMaxUnlockedPart((m) => (2 > m ? 2 : m));
                  setActiveTestPart(2);
                  setErr(null);
                }}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next: Part 2 →
              </button>
            </div>
          </section>
          )}

          {activeTestPart === 2 && (
          <section className="space-y-8 border-0 bg-transparent p-0 pt-2 shadow-none">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-serif text-xl font-semibold italic text-ink md:text-2xl">
                Part 2: Written ({openQuestions.length || '…'})
              </h3>
              <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-sans font-semibold text-stone-800">
                Written response
              </span>
            </div>
            {openQuestions.length > 0 && openQuestions[openStepIndex] && (
              <>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 font-sans text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <span>
                    Question {openStepIndex + 1} of {openQuestions.length}
                  </span>
                  {part2Complete && (
                    <span className="rounded-full border border-emerald-300/60 bg-emerald-50 px-2 py-0.5 text-emerald-800">
                      Section complete
                    </span>
                  )}
                </div>
                <div
                  key={openQuestions[openStepIndex].id}
                  className="animate-slide-up rounded-xl border border-[#1e293b]/35 bg-parchment-200/95 p-4 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.42)] sm:p-5"
                >
                  <label className="mb-2 block font-serif text-xl font-semibold text-ink">
                    Question {openStepIndex + 1}
                  </label>
                  <p className="mb-4 select-none font-serif text-lg leading-9 text-ink-muted">
                    {openQuestions[openStepIndex].text}
                  </p>
                  <textarea
                    className="input-field min-h-[180px] w-full select-text rounded-sm border-[#1e293b]/40 bg-parchment-150/95 font-serif text-lg leading-8 text-ink placeholder:text-stone-600 backdrop-blur-[1px]"
                    value={openAnswers[openQuestions[openStepIndex].id] ?? ''}
                    onChange={(e) =>
                      setOpenAnswers((a) => ({ ...a, [openQuestions[openStepIndex].id]: e.target.value }))
                    }
                    placeholder="Your answer…"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    disabled={openStepIndex === 0}
                    onClick={() => setOpenStepIndex((i) => Math.max(0, i - 1))}
                    className="rounded-md border border-[#1e293b]/45 bg-transparent px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Previous question
                  </button>
                  {openStepIndex < openQuestions.length - 1 && (
                    <button
                      type="button"
                      disabled={(openAnswers[openQuestions[openStepIndex].id] ?? '').trim().length === 0}
                      onClick={() => {
                        const cur = openQuestions[openStepIndex];
                        if ((openAnswers[cur.id] ?? '').trim().length === 0) return;
                        const idx = openStepIndex;
                        window.setTimeout(() => setOpenStepIndex(idx + 1), 400);
                      }}
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Save &amp; next question
                    </button>
                  )}
                  {openStepIndex === openQuestions.length - 1 && (
                    <p className="font-sans text-sm text-ink-soft">
                      Last written prompt — finish your answer, then use <strong className="font-semibold text-ink">Next: Part 3</strong>{' '}
                      below when all prompts are complete.
                    </p>
                  )}
                </div>
              </>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1e293b]/25 pt-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTestPart(1);
                  setErr(null);
                }}
                className="rounded-md border border-[#1e293b]/45 bg-transparent px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06] disabled:opacity-50"
              >
                ← Part 1
              </button>
              <p className="order-3 w-full text-center font-sans text-sm text-ink-soft sm:order-none sm:w-auto">
                {part2Complete
                  ? 'All written answers complete. Continue when ready.'
                  : 'Answer each prompt — use Save & next to reveal the following question.'}
              </p>
              <button
                type="button"
                disabled={!part2Complete || correctingQuestions.length === 0}
                onClick={() => {
                  setMaxUnlockedPart((m) => (3 > m ? 3 : m));
                  setActiveTestPart(3);
                  setErr(null);
                }}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next: Part 3 →
              </button>
            </div>
          </section>
          )}

          {activeTestPart === 3 && (
            <section className="space-y-8 border-0 bg-transparent p-0 pt-2 shadow-none">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-serif text-xl font-semibold italic text-ink md:text-2xl">
                  Part 3: Correcting mistakes ({correctingQuestions.length || '…'})
                </h3>
                <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-sans font-semibold text-stone-800">
                  Debug mindset
                </span>
              </div>
              {correctingQuestions.length > 0 && correctingQuestions[correctingStepIndex] && (
                <>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 font-sans text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    <span>
                      Item {correctingStepIndex + 1} of {correctingQuestions.length}
                    </span>
                    {part3Complete && (
                      <span className="rounded-full border border-emerald-300/60 bg-emerald-50 px-2 py-0.5 text-emerald-800">
                        Section complete
                      </span>
                    )}
                  </div>
                  <div
                    key={correctingQuestions[correctingStepIndex].id}
                    className="animate-slide-up rounded-xl border border-[#1e293b]/35 bg-parchment-200/95 p-4 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.42)] sm:p-5"
                  >
                    <label className="mb-2 block font-serif text-xl font-semibold text-ink">
                      Correcting mistakes {correctingStepIndex + 1}
                    </label>
                    <p className="mb-4 select-none font-serif text-lg leading-9 text-ink-muted">
                      {correctingQuestions[correctingStepIndex].text}
                    </p>
                    <textarea
                      className="input-field min-h-[180px] w-full select-text rounded-sm border-[#1e293b]/40 bg-parchment-150/95 font-serif text-lg leading-8 text-ink placeholder:text-stone-600 backdrop-blur-[1px]"
                      value={correctingAnswers[correctingQuestions[correctingStepIndex].id] ?? ''}
                      onChange={(e) =>
                        setCorrectingAnswers((a) => ({
                          ...a,
                          [correctingQuestions[correctingStepIndex].id]: e.target.value,
                        }))
                      }
                      placeholder="Explain what is wrong, then provide the corrected version…"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      disabled={correctingStepIndex === 0}
                      onClick={() => setCorrectingStepIndex((i) => Math.max(0, i - 1))}
                      className="rounded-md border border-[#1e293b]/45 bg-transparent px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ← Previous item
                    </button>
                    {correctingStepIndex < correctingQuestions.length - 1 && (
                      <button
                        type="button"
                        disabled={
                          (correctingAnswers[correctingQuestions[correctingStepIndex].id] ?? '').trim().length === 0
                        }
                        onClick={() => {
                          const cur = correctingQuestions[correctingStepIndex];
                          if ((correctingAnswers[cur.id] ?? '').trim().length === 0) return;
                          const idx = correctingStepIndex;
                          window.setTimeout(() => setCorrectingStepIndex(idx + 1), 400);
                        }}
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Save &amp; next item
                      </button>
                    )}
                    {correctingStepIndex === correctingQuestions.length - 1 && (
                      <p className="font-sans text-sm text-ink-soft">
                        Last prompt — finish your correction, then use <strong className="font-semibold text-ink">Next: Part 4</strong>{' '}
                        when every item is complete.
                      </p>
                    )}
                  </div>
                </>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1e293b]/25 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTestPart(2);
                    setErr(null);
                  }}
                  className="rounded-md border border-[#1e293b]/45 bg-transparent px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06] disabled:opacity-50"
                >
                  ← Part 2
                </button>
                <p className="order-3 w-full text-center font-sans text-sm text-ink-soft sm:order-none sm:w-auto">
                  {part3Complete
                    ? 'All corrections complete. Continue when ready.'
                    : 'Complete each item — Save & next reveals the following prompt.'}
                </p>
                <button
                  type="button"
                  disabled={!part3Complete || practicalQuestions.length === 0}
                  onClick={() => {
                    setMaxUnlockedPart((m) => (4 > m ? 4 : m));
                    setActiveTestPart(4);
                    setErr(null);
                  }}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next: Part 4 →
                </button>
              </div>
            </section>
          )}

          {activeTestPart === 4 && practicalQuestions.length > 0 && (
            <section className="space-y-8 border-0 bg-transparent p-0 pt-2 shadow-none">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-serif text-xl font-semibold italic text-ink md:text-2xl">
                  Part 4: Practical challenges ({practicalQuestions.length})
                </h3>
                <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-sans font-semibold text-stone-800">
                  Core challenge
                </span>
              </div>
              {practicalQuestions[practicalStepIndex] && (
                <>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 font-sans text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    <span>
                      Challenge {practicalStepIndex + 1} of {practicalQuestions.length}
                    </span>
                    {part4Complete && (
                      <span className="rounded-full border border-emerald-300/60 bg-emerald-50 px-2 py-0.5 text-emerald-800">
                        Section complete
                      </span>
                    )}
                  </div>
                  <div
                    key={practicalQuestions[practicalStepIndex].id}
                    className="animate-slide-up rounded-xl border border-[#1e293b]/35 bg-parchment-200/95 p-4 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.42)] sm:p-5"
                  >
                    <label className="mb-2 block font-serif text-xl font-semibold text-ink">
                      Practical question {practicalStepIndex + 1}
                    </label>
                    <p className="mb-4 select-none font-serif text-lg leading-9 text-ink-muted">
                      {practicalQuestions[practicalStepIndex].text}
                    </p>
                    <textarea
                      className="input-field min-h-[190px] w-full select-text rounded-sm border-[#1e293b]/40 bg-parchment-150/95 font-serif text-lg leading-8 text-ink placeholder:text-stone-600 backdrop-blur-[1px]"
                      value={practicalAnswers[practicalQuestions[practicalStepIndex].id] ?? ''}
                      onChange={(e) =>
                        setPracticalAnswers((a) => ({
                          ...a,
                          [practicalQuestions[practicalStepIndex].id]: e.target.value,
                        }))
                      }
                      placeholder="Describe your practical approach and solution…"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      disabled={practicalStepIndex === 0}
                      onClick={() => setPracticalStepIndex((i) => Math.max(0, i - 1))}
                      className="rounded-md border border-[#1e293b]/45 bg-transparent px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ← Previous challenge
                    </button>
                    {practicalStepIndex < practicalQuestions.length - 1 && (
                      <button
                        type="button"
                        disabled={
                          (practicalAnswers[practicalQuestions[practicalStepIndex].id] ?? '').trim().length === 0
                        }
                        onClick={() => {
                          const cur = practicalQuestions[practicalStepIndex];
                          if ((practicalAnswers[cur.id] ?? '').trim().length === 0) return;
                          const idx = practicalStepIndex;
                          window.setTimeout(() => setPracticalStepIndex(idx + 1), 400);
                        }}
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Save &amp; next challenge
                      </button>
                    )}
                    {practicalStepIndex === practicalQuestions.length - 1 && (
                      <p className="font-sans text-sm text-ink-soft">
                        Last challenge — finish your answer, then use <strong className="font-semibold text-ink">Next: Part 5</strong>{' '}
                        when all challenges are complete.
                      </p>
                    )}
                  </div>
                </>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1e293b]/25 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTestPart(3);
                    setErr(null);
                  }}
                  className="rounded-md border border-[#1e293b]/45 bg-transparent px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06] disabled:opacity-50"
                >
                  ← Part 3
                </button>
                <p className="order-3 w-full text-center font-sans text-sm text-ink-soft sm:order-none sm:w-auto">
                  {part4Complete
                    ? 'All practical challenges complete. Continue when ready.'
                    : 'Complete each challenge — Save & next reveals the following question.'}
                </p>
                <button
                  type="button"
                  disabled={!part4Complete}
                  onClick={() => {
                    setMaxUnlockedPart((m) => (5 > m ? 5 : m));
                    setActiveTestPart(5);
                    setErr(null);
                  }}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next: Part 5 →
                </button>
              </div>
            </section>
          )}

          {activeTestPart === 5 && (
            <section className="space-y-8 border-0 bg-transparent p-0 pt-2 shadow-none">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-serif text-xl font-semibold italic text-ink md:text-2xl">Part 5: AI interview (5)</h3>
                <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-sans font-semibold text-stone-800">
                  Voice interview (camera optional)
                </span>
              </div>
              <div className="space-y-4 rounded-2xl border border-[#1e293b]/30 bg-parchment-50/80 p-4 shadow-[0_10px_30px_-18px_rgba(45,34,26,0.45)] md:p-5">
                {typeof window !== 'undefined' && !window.isSecureContext ? (
                  <div className="rounded-lg border border-amber-400/80 bg-amber-50/95 p-3 font-sans text-sm leading-relaxed text-amber-950">
                    <strong className="font-semibold">Microphone and camera need a secure page.</strong> Use{' '}
                    <strong className="font-semibold">https://</strong> or open this app on <strong className="font-semibold">localhost</strong>. On plain{' '}
                    <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">http://</code> (except localhost), the browser will block media.
                  </div>
                ) : null}
                <div className="rounded-xl border border-[#1e293b]/20 bg-[#0f172a]/[0.03] p-4">
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">How this part works</p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-ink-soft">
                    <strong className="text-ink">Video interview:</strong> each question is played as audio only (nothing written on screen).
                    Reply by voice like a short call, then save each round to continue.
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border border-[#1e293b]/20 bg-white/70 px-3 py-2">
                      <p className="font-sans text-xs font-semibold text-ink">1) Start session</p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                        The browser usually asks for the <strong className="font-semibold text-ink">microphone</strong> first; camera is optional for preview. Then click Start.
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#1e293b]/20 bg-white/70 px-3 py-2">
                      <p className="font-sans text-xs font-semibold text-ink">2) Listen then answer</p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-soft">Wait for audio to finish, then speak clearly in one take.</p>
                    </div>
                    <div className="rounded-lg border border-[#1e293b]/20 bg-white/70 px-3 py-2">
                      <p className="font-sans text-xs font-semibold text-ink">3) Save every round</p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-soft">Use Save & next round until all rounds are completed.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1e293b]/20 bg-white/70 px-3.5 py-3">
                  <label className="flex cursor-pointer items-center gap-2 font-sans text-sm font-medium text-ink">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-stone-400 text-stone-800"
                      checked={autoAskAnswer}
                      onChange={(e) => setAutoAskAnswer(e.target.checked)}
                    />
                    Auto-start microphone after each question
                  </label>
                  <span className="rounded-full bg-stone-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
                    Integrity monitoring active
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className={`rounded-full px-2.5 py-1 ${micReady ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>
                    Mic: {micReady ? 'ready' : 'off'}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 ${cameraReady ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>
                    Camera: {cameraReady ? 'ready' : 'off'}
                  </span>
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-stone-700">
                    Tab switches: {tabSwitchCount}
                  </span>
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-stone-700">
                    Face missing: {faceMissingCount}
                  </span>
                </div>

                <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-[#1e293b]/30 bg-stone-950 shadow-inner">
                  <video
                    ref={interviewVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`mx-auto block bg-stone-900 object-cover object-top ${
                      interviewStarted ? 'aspect-video min-h-[220px] w-full sm:min-h-[320px]' : 'h-40 w-full max-w-sm sm:h-48'
                    }`}
                  />
                </div>
                {!interviewStarted && (
                  <button
                    type="button"
                    onClick={startInterviewSession}
                    className="inline-flex w-full max-w-3xl items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_-12px_rgba(92,64,51,0.8)] transition hover:brightness-110"
                  >
                    Start AI interview
                  </button>
                )}
                {interviewNotice && (
                  <div
                    className="mt-3 rounded-xl border border-amber-300/80 bg-amber-50/95 px-4 py-3 font-sans text-sm leading-relaxed text-amber-950"
                    role="status"
                  >
                    {interviewNotice}
                  </div>
                )}
                {interviewStarted && (
                  <div className="mt-3 space-y-3 rounded-xl border border-[#1e293b]/20 bg-white/70 px-3 py-3">
                    <button
                      type="button"
                      disabled={interviewMediaPending}
                      onClick={retryInterviewMedia}
                      className="inline-flex w-full max-w-md items-center justify-center rounded-lg bg-gradient-to-r from-[#1e293b] to-[#a07856] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {interviewMediaPending ? 'Requesting access…' : 'Allow microphone (retry)'}
                    </button>
                    <ol className="list-decimal space-y-1 pl-5 font-sans text-xs leading-relaxed text-ink-soft">
                      <li>Click <strong className="text-ink">Allow microphone</strong> above (or the lock icon in the address bar).</li>
                      <li>Set <strong className="text-ink">Microphone</strong> to Ask or Allow. Camera is optional for preview only.</li>
                      <li>If no prompt appears, check OS privacy settings (Windows: Settings → Privacy → Microphone).</li>
                    </ol>
                  </div>
                )}
              </div>

              {interviewStarted && interviewQuestions[interviewIndex] && (
                <div className="space-y-4 rounded-xl border border-[#1e293b]/30 bg-parchment-50/75 p-4">
                  <div className="flex flex-wrap items-center gap-3 border-b border-[#1e293b]/20 pb-3">
                    <div className="flex flex-wrap gap-2 font-sans text-xs font-semibold">
                      <span
                        className={`rounded-full px-3 py-1 ${interviewerSpeaking ? 'bg-[#1e293b] text-white' : 'bg-stone-200 text-stone-600'}`}
                      >
                        1 · Listen
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 ${!interviewerSpeaking ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}
                      >
                        2 · Speak
                      </span>
                    </div>
                    {interviewerSpeaking && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                        Examiner speaking — listen
                      </span>
                    )}
                    {speechListening && !interviewerSpeaking && (
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-900">
                        Mic on — your turn
                      </span>
                    )}
                    <span className="ml-auto font-sans text-xs font-semibold text-[#4f46e5]">
                      Round {interviewIndex + 1} / {interviewQuestions.length}
                    </span>
                  </div>
                  <p className="font-sans text-center text-sm text-ink-soft">
                    The question plays as audio only. After it finishes, answer by voice or type your reply below — both count for this round.
                  </p>
                  {!micReady && !interviewerSpeaking && (
                    <p className="rounded-lg border border-sky-200 bg-sky-50/90 px-3 py-2 text-center font-sans text-xs leading-relaxed text-sky-950">
                      Microphone is off. Use <strong className="font-semibold">Allow microphone (retry)</strong> above, or type your answer in the box below.
                    </p>
                  )}
                  <div className="flex flex-wrap justify-center gap-2">
                    {speechSupported && (
                      <button
                        type="button"
                        title={
                          !micReady
                            ? 'Turn on the microphone with the button above, then try again.'
                            : undefined
                        }
                        disabled={interviewerSpeaking || !micReady}
                        onClick={() => {
                          if (speechListening) {
                            stopVoiceCapture();
                          } else {
                            beginVoiceCapture();
                          }
                        }}
                        className="rounded-md border border-[#1e293b]/40 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {speechListening ? 'Stop microphone' : 'Speak your answer'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        speakInterviewQuestion(interviewQuestions[interviewIndex].text, {
                          onComplete: () => maybeAutoListenAfterQuestion(),
                        })
                      }
                      className="rounded-md border border-[#1e293b]/40 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06]"
                    >
                      Play question audio again
                    </button>
                  </div>
                  <div
                    className={`rounded-lg border px-4 py-3 text-center font-sans text-sm ${
                      interviewDraft.trim().length > 0
                        ? 'border-emerald-300 bg-emerald-50/90 text-emerald-900'
                        : 'border-stone-200 bg-stone-50/80 text-stone-600'
                    }`}
                    aria-live="polite"
                  >
                    {interviewDraft.trim().length > 0
                      ? 'Answer ready — you can save and continue.'
                      : interviewerSpeaking
                        ? 'Listen to the question…'
                        : !micReady
                          ? 'Grant microphone access above, or type your answer below.'
                          : speechSupported
                            ? 'Use Speak your answer when you are ready, or type below.'
                            : 'Type your answer in the box below.'}
                  </div>
                  {!speechSupported ? (
                    <div className="rounded-lg border border-[#1e293b]/25 bg-white/80 px-3 py-3 font-sans text-sm">
                      <p className="text-xs font-semibold text-ink">This browser does not support voice capture — type your answer.</p>
                      <label htmlFor="interview-draft-type" className="mt-2 block text-xs font-medium text-ink-soft">
                        Your answer for this round
                      </label>
                      <textarea
                        id="interview-draft-type"
                        rows={4}
                        value={interviewDraft}
                        onChange={(e) => setInterviewDraft(e.target.value)}
                        placeholder="Write your answer here."
                        className="mt-1 w-full resize-y rounded-md border border-[#1e293b]/30 bg-white px-3 py-2 text-sm text-ink shadow-inner placeholder:text-stone-400 focus:border-[#1e293b]/60 focus:outline-none focus:ring-2 focus:ring-[#1e293b]/20"
                      />
                    </div>
                  ) : (
                    <details className="group rounded-lg border border-[#1e293b]/25 bg-white/80 px-3 py-2 font-sans text-sm">
                      <summary className="cursor-pointer select-none font-semibold text-ink hover:text-[#1e293b]">
                        Type your answer instead (if the mic is blocked or you prefer typing)
                      </summary>
                      <label htmlFor="interview-draft-type" className="mt-2 block text-xs font-medium text-ink-soft">
                        Your answer for this round
                      </label>
                      <textarea
                        id="interview-draft-type"
                        rows={4}
                        value={interviewDraft}
                        onChange={(e) => setInterviewDraft(e.target.value)}
                        placeholder="Write your spoken-style answer here. You can edit text from voice recognition too."
                        className="mt-1 w-full resize-y rounded-md border border-[#1e293b]/30 bg-white px-3 py-2 text-sm text-ink shadow-inner placeholder:text-stone-400 focus:border-[#1e293b]/60 focus:outline-none focus:ring-2 focus:ring-[#1e293b]/20"
                      />
                    </details>
                  )}
                  <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#1e293b]/25 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        const q = interviewQuestions[interviewIndex];
                        const answer = interviewDraft.trim();
                        if (!q || !answer) {
                          setErr(
                            'Add an answer for this round: use the microphone after the question finishes, or type in “Type your answer instead”, then save.',
                          );
                          return;
                        }
                        setErr(null);
                        setAiInterviewAnswers((a) => ({ ...a, [q.id]: answer }));
                        setInterviewTurns((t) => [...t, { questionId: q.id, question: q.text, answer, startedAt: new Date().toISOString() }]);
                        setInterviewDraft('');
                        stopVoiceCapture();
                        if (interviewIndex < interviewQuestions.length - 1) {
                          const next = interviewQuestions[interviewIndex + 1];
                          setInterviewIndex((i) => i + 1);
                          speakInterviewQuestion(next.text, {
                            onComplete: () => maybeAutoListenAfterQuestion(),
                          });
                        }
                      }}
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                    >
                      {interviewIndex < interviewQuestions.length - 1 ? 'Save & next round' : 'Save final round'}
                    </button>
                  </div>
                </div>
              )}

              {interviewTurns.length > 0 && (
                <div className="rounded-xl border border-[#1e293b]/25 bg-[#0f172a]/[0.03] p-4">
                  <p className="font-sans text-sm font-semibold text-ink">
                    Rounds completed: {interviewTurns.length} / {interviewQuestions.length}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1e293b]/25 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTestPart(4);
                    setErr(null);
                  }}
                  className="rounded-md border border-[#1e293b]/45 bg-transparent px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06] disabled:opacity-50"
                >
                  ← Part 4
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmitForGrading}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Submit for grading
                </button>
              </div>
            </section>
          )}
          {err && <p className="text-sm text-red-600">{err}</p>}
          </div>
        </div>
      )}

      {phase === 'saving' && (
        <div className="flex min-h-[min(60vh,520px)] flex-col items-center justify-center gap-5 rounded-xl border border-[#1e293b]/30 bg-parchment-100 px-6 py-14 text-center font-serif">
          <div
            className="h-11 w-11 animate-spin rounded-full border-[3px] border-[#4f46e5]/30 border-t-[#4f46e5]"
            aria-hidden
          />
          <div>
            <p className="text-xl font-semibold italic text-ink">Grading your assessment</p>
            <p className="mt-2 max-w-md font-sans text-sm text-ink-soft">
              AI is scoring your responses. Please keep this tab open.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
