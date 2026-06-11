from dataclasses import dataclass
from enum import Enum


class ProviderName(str, Enum):
    NASA = "nasa"
    EONET = "eonet"
    EPIC = "epic"
    EXOPLANET = "exoplanet"
    GIBS = "gibs"
    IMAGES = "images"
    OSDR = "osdr"
    SSC = "ssc"
    SSD = "ssd"
    TECHPORT = "techport"
    TLE = "tle"
    TREK = "trek"


@dataclass(frozen=True)
class Provider:
    base_url: str
    requires_api_key: bool = False


PROVIDERS = {
    ProviderName.NASA: Provider("https://api.nasa.gov", True),
    ProviderName.EONET: Provider("https://eonet.gsfc.nasa.gov/api/v3"),
    ProviderName.EPIC: Provider("https://epic.gsfc.nasa.gov/api"),
    ProviderName.EXOPLANET: Provider("https://exoplanetarchive.ipac.caltech.edu"),
    ProviderName.GIBS: Provider("https://gibs.earthdata.nasa.gov"),
    ProviderName.IMAGES: Provider("https://images-api.nasa.gov"),
    ProviderName.OSDR: Provider("https://osdr.nasa.gov"),
    ProviderName.SSC: Provider("https://sscweb.gsfc.nasa.gov/WS/sscr/2"),
    ProviderName.SSD: Provider("https://ssd-api.jpl.nasa.gov"),
    ProviderName.TECHPORT: Provider("https://techport.nasa.gov/api"),
    ProviderName.TLE: Provider("https://tle.ivanstanojevic.me/api/tle"),
    ProviderName.TREK: Provider("https://trek.nasa.gov"),
}
