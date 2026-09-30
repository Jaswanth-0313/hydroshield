"""
Script to generate complete datasets for Tehri Dam and Mullaperiyar Dam.
Ensures full geographic and topological consistency across all 4 Indian Dam study areas.
"""
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

# ==================== 1. TEHRI DAM (Bhagirathi River, Uttarakhand) ====================
# Dam at (30.3780, 78.4800). Downstream gorge flows South-Southwest through New Tehri, Koteshwar, Devprayag, Shivpuri, Rishikesh, Haridwar.

tehri_river_points = [
    [78.4800, 30.3780],  # Tehri Dam
    [78.4950, 30.3200],  # Koteshwar Dam / Hydro
    [78.5300, 30.2500],  # Maletha reach
    [78.5980, 30.1460],  # Devprayag (Bhagirathi + Alaknanda -> Ganga)
    [78.5400, 30.1200],  # Kaudiyala
    [78.4200, 30.1350],  # Shivpuri rapids
    [78.3200, 30.1150],  # Muni Ki Reti
    [78.2900, 30.0860],  # Rishikesh Plain
    [78.1600, 29.9450]   # Haridwar Barrage
]

tehri_river_geojson = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Bhagirathi - Upper Ganga Downstream Channel",
                "dam_id": "dam-tehri",
                "length_km": 60.0,
                "avg_width_m": 120.0,
                "slope": 0.0085
            },
            "geometry": {
                "type": "LineString",
                "coordinates": tehri_river_points
            }
        }
    ]
}
with open(DATA_DIR / "rivers" / "dam-tehri.geojson", "w") as f:
    json.dump(tehri_river_geojson, f, indent=2)

tehri_villages = [
    {
        "id": "vil-thr-01",
        "name": "Koteshwar Hydro Colony",
        "population": 3800,
        "vulnerable_population_count": 920,
        "distance_from_dam_km": 6.5,
        "elevation_m": 580.0,
        "coordinates": {"lat": 30.3200, "lng": 78.4950},
        "description": "Downstream regulatory dam colony and construction township."
    },
    {
        "id": "vil-thr-02",
        "name": "Maletha Valley Settlement",
        "population": 6200,
        "vulnerable_population_count": 1650,
        "distance_from_dam_km": 15.0,
        "elevation_m": 510.0,
        "coordinates": {"lat": 30.2500, "lng": 78.5300},
        "description": "Agricultural valley floor settlement on NH-58."
    },
    {
        "id": "vil-thr-03",
        "name": "Devprayag Confluence Town",
        "population": 9400,
        "vulnerable_population_count": 2800,
        "distance_from_dam_km": 28.5,
        "elevation_m": 460.0,
        "coordinates": {"lat": 30.1460, "lng": 78.5980},
        "description": "Historic holy pilgrimage town situated directly at confluence."
    },
    {
        "id": "vil-thr-04",
        "name": "Kaudiyala Riverside Hamlet",
        "population": 2100,
        "vulnerable_population_count": 520,
        "distance_from_dam_km": 36.0,
        "elevation_m": 410.0,
        "coordinates": {"lat": 30.1200, "lng": 78.5400},
        "description": "Eco-tourism and rafting hub located in narrow mountain gorge."
    },
    {
        "id": "vil-thr-05",
        "name": "Shivpuri Gorge Settlement",
        "population": 4800,
        "vulnerable_population_count": 1200,
        "distance_from_dam_km": 46.0,
        "elevation_m": 375.0,
        "coordinates": {"lat": 30.1350, "lng": 78.4200},
        "description": "Gorge bottleneck area with high velocity surge risk."
    },
    {
        "id": "vil-thr-06",
        "name": "Rishikesh Holy Ghats & Town",
        "population": 38500,
        "vulnerable_population_count": 9800,
        "distance_from_dam_km": 54.0,
        "elevation_m": 340.0,
        "coordinates": {"lat": 30.0860, "lng": 78.2900},
        "description": "Major urban population center where Himalayan river debouches into plains."
    }
]
with open(DATA_DIR / "villages" / "dam-tehri.json", "w") as f:
    json.dump(tehri_villages, f, indent=2)

tehri_shelters = [
    {
        "id": "sh-thr-01",
        "name": "New Tehri Hilltop Administrative Complex",
        "capacity": 4500,
        "elevation_m": 1750.0,
        "coordinates": {"lat": 30.3920, "lng": 78.4350},
        "facilities": ["Helipad", "Emergency Food Stock", "Hospital Complex"]
    },
    {
        "id": "sh-thr-02",
        "name": "Devprayag High Ridge Inter-College",
        "capacity": 2500,
        "elevation_m": 680.0,
        "coordinates": {"lat": 30.1550, "lng": 78.6050},
        "facilities": ["Water Tank", "Wireless Base", "Medical Unit"]
    },
    {
        "id": "sh-thr-03",
        "name": "AIIMS Rishikesh High Ground Complex",
        "capacity": 6000,
        "elevation_m": 385.0,
        "coordinates": {"lat": 30.0750, "lng": 78.2850},
        "facilities": ["Apex Trauma Hospital", "Helipad", "NDRF Outpost"]
    }
]
with open(DATA_DIR / "shelters" / "dam-tehri.json", "w") as f:
    json.dump(tehri_shelters, f, indent=2)

tehri_infrastructure = [
    {
        "id": "inf-thr-01",
        "name": "Koteshwar Hydro Spillway & Bridge",
        "category": "bridge",
        "coordinates": {"lat": 30.3190, "lng": 78.4960},
        "distance_from_dam_km": 6.6,
        "elevation_m": 575.0,
        "criticality": "CRITICAL"
    },
    {
        "id": "inf-thr-02",
        "name": "Devprayag Historic Sangam Suspension Bridge",
        "category": "bridge",
        "coordinates": {"lat": 30.1455, "lng": 78.5975},
        "distance_from_dam_km": 28.6,
        "elevation_m": 458.0,
        "criticality": "CRITICAL"
    },
    {
        "id": "inf-thr-03",
        "name": "AIIMS Apex Hospital Rishikesh",
        "category": "hospital",
        "coordinates": {"lat": 30.0760, "lng": 78.2860},
        "distance_from_dam_km": 55.0,
        "elevation_m": 380.0,
        "criticality": "CRITICAL"
    },
    {
        "id": "inf-thr-04",
        "name": "Rishikesh Ram Jhula Suspension Bridge",
        "category": "bridge",
        "coordinates": {"lat": 30.1220, "lng": 78.3150},
        "distance_from_dam_km": 52.0,
        "elevation_m": 348.0,
        "criticality": "HIGH"
    }
]
with open(DATA_DIR / "infrastructure" / "dam-tehri.json", "w") as f:
    json.dump(tehri_infrastructure, f, indent=2)

tehri_roads = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "id": "road-thr-01",
                "name": "NH-58 River Highway (Gorge Valley)",
                "node_from": "vil-thr-02",
                "node_to": "vil-thr-03",
                "distance_km": 13.5,
                "avg_elevation_m": 485.0
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [[78.5300, 30.2500], [78.5600, 30.1900], [78.5980, 30.1460]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": "road-thr-02",
                "name": "Devprayag High Ridge Escape Route",
                "node_from": "vil-thr-03",
                "node_to": "sh-thr-02",
                "distance_km": 1.9,
                "avg_elevation_m": 670.0
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [[78.5980, 30.1460], [78.6010, 30.1500], [78.6050, 30.1550]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": "road-thr-03",
                "name": "Rishikesh AIIMS Escape Arterial",
                "node_from": "vil-thr-06",
                "node_to": "sh-thr-03",
                "distance_km": 2.2,
                "avg_elevation_m": 382.0
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [[78.2900, 30.0860], [78.2880, 30.0800], [78.2850, 30.0750]]
            }
        }
    ]
}
with open(DATA_DIR / "roads" / "dam-tehri.geojson", "w") as f:
    json.dump(tehri_roads, f, indent=2)

# ==================== 2. MULLAPERIYAR DAM (Periyar Basin, Kerala) ====================
# Dam at (9.5280, 77.1436). River flows West through Vallakadavu, Vandiperiyar, Upputhara, Ayyappancoil, entering Idukki Reservoir.

mullaperiyar_river_points = [
    [77.1436, 9.5280],  # Mullaperiyar Dam
    [77.1050, 9.5550],  # Vallakadavu
    [77.0850, 9.5750],  # Vandiperiyar bridge
    [77.0450, 9.6050],  # Manjumala reach
    [76.9950, 9.6450],  # Upputhara
    [76.9650, 9.6850],  # Ayyappancoil
    [76.9722, 9.8497]   # Enters Idukki Reservoir (Cascade failure risk)
]

mullaperiyar_river_geojson = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Periyar - Upper Catchment Reach",
                "dam_id": "dam-mullaperiyar",
                "length_km": 35.0,
                "avg_width_m": 65.0,
                "slope": 0.0042
            },
            "geometry": {
                "type": "LineString",
                "coordinates": mullaperiyar_river_points
            }
        }
    ]
}
with open(DATA_DIR / "rivers" / "dam-mullaperiyar.geojson", "w") as f:
    json.dump(mullaperiyar_river_geojson, f, indent=2)

mullaperiyar_villages = [
    {
        "id": "vil-mlp-01",
        "name": "Vallakadavu Settlement",
        "population": 3400,
        "vulnerable_population_count": 890,
        "distance_from_dam_km": 4.5,
        "elevation_m": 820.0,
        "coordinates": {"lat": 9.5550, "lng": 77.1050},
        "description": "First populated hamlet directly 4.5 km below Mullaperiyar dam spillway."
    },
    {
        "id": "vil-mlp-02",
        "name": "Vandiperiyar Town",
        "population": 14200,
        "vulnerable_population_count": 3900,
        "distance_from_dam_km": 9.2,
        "elevation_m": 780.0,
        "coordinates": {"lat": 9.5750, "lng": 77.0850},
        "description": "Major commercial plantation township on NH-183 (Kottayam-Kumily road)."
    },
    {
        "id": "vil-mlp-03",
        "name": "Upputhara Valley Community",
        "population": 8900,
        "vulnerable_population_count": 2400,
        "distance_from_dam_km": 19.5,
        "elevation_m": 740.0,
        "coordinates": {"lat": 9.6450, "lng": 76.9950},
        "description": "Low-lying spice agricultural valley prone to rapid inundation."
    },
    {
        "id": "vil-mlp-04",
        "name": "Ayyappancoil Inflow Zone",
        "population": 6500,
        "vulnerable_population_count": 1750,
        "distance_from_dam_km": 28.0,
        "elevation_m": 715.0,
        "coordinates": {"lat": 9.6850, "lng": 76.9650},
        "description": "Direct inflow entry zone into backwaters of Idukki reservoir."
    }
]
with open(DATA_DIR / "villages" / "dam-mullaperiyar.json", "w") as f:
    json.dump(mullaperiyar_villages, f, indent=2)

mullaperiyar_shelters = [
    {
        "id": "sh-mlp-01",
        "name": "Vandiperiyar High Ridge Community Relief Camp",
        "capacity": 3000,
        "elevation_m": 920.0,
        "coordinates": {"lat": 9.5850, "lng": 77.0950},
        "facilities": ["Emergency Kitchen", "Clean Water Tank", "Solar Generator"]
    },
    {
        "id": "sh-mlp-02",
        "name": "Upputhara Higher Secondary School Relief Center",
        "capacity": 2200,
        "elevation_m": 840.0,
        "coordinates": {"lat": 9.6550, "lng": 77.0050},
        "facilities": ["Medical Bay", "Satellite Phone", "Food Stock"]
    }
]
with open(DATA_DIR / "shelters" / "dam-mullaperiyar.json", "w") as f:
    json.dump(mullaperiyar_shelters, f, indent=2)

mullaperiyar_infrastructure = [
    {
        "id": "inf-mlp-01",
        "name": "Vallakadavu Cause-way Bridge",
        "category": "bridge",
        "coordinates": {"lat": 9.5540, "lng": 77.1040},
        "distance_from_dam_km": 4.4,
        "elevation_m": 815.0,
        "criticality": "CRITICAL"
    },
    {
        "id": "inf-mlp-02",
        "name": "Vandiperiyar Main Periyar Bridge (NH-183)",
        "category": "bridge",
        "coordinates": {"lat": 9.5740, "lng": 77.0840},
        "distance_from_dam_km": 9.0,
        "elevation_m": 776.0,
        "criticality": "CRITICAL"
    },
    {
        "id": "inf-mlp-03",
        "name": "Vandiperiyar Community Health Centre",
        "category": "hospital",
        "coordinates": {"lat": 9.5780, "lng": 77.0870},
        "distance_from_dam_km": 9.5,
        "elevation_m": 790.0,
        "criticality": "HIGH"
    }
]
with open(DATA_DIR / "infrastructure" / "dam-mullaperiyar.json", "w") as f:
    json.dump(mullaperiyar_infrastructure, f, indent=2)

mullaperiyar_roads = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "id": "road-mlp-01",
                "name": "Vallakadavu - Vandiperiyar Valley Link",
                "node_from": "vil-mlp-01",
                "node_to": "vil-mlp-02",
                "distance_km": 5.2,
                "avg_elevation_m": 795.0
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [[77.1050, 9.5550], [77.0950, 9.5650], [77.0850, 9.5750]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": "road-mlp-02",
                "name": "Vandiperiyar High Ridge Escape Road",
                "node_from": "vil-mlp-02",
                "node_to": "sh-mlp-01",
                "distance_km": 1.8,
                "avg_elevation_m": 905.0
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [[77.0850, 9.5750], [77.0900, 9.5800], [77.0950, 9.5850]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": "road-mlp-03",
                "name": "Upputhara Ridge Escape Road",
                "node_from": "vil-mlp-03",
                "node_to": "sh-mlp-02",
                "distance_km": 1.6,
                "avg_elevation_m": 830.0
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [[76.9950, 9.6450], [77.0000, 9.6500], [77.0050, 9.6550]]
            }
        }
    ]
}
with open(DATA_DIR / "roads" / "dam-mullaperiyar.geojson", "w") as f:
    json.dump(mullaperiyar_roads, f, indent=2)

print("Tehri Dam and Mullaperiyar Dam datasets generated successfully.")
