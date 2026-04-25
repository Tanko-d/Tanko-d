#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Map, Address, Env,
};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Drivers,
    GasStations,
    DriverConfigs,
}

#[contracttype]
#[derive(Clone)]
pub struct DriverConfig {
    pub escrow_limit: i128,
    pub escrow_used: i128,
    pub escrow_available: i128,
    pub is_active: bool,
    pub registered_at: u64,
}

impl Default for DriverConfig {
    fn default() -> Self {
        Self {
            escrow_limit: 0,
            escrow_used: 0,
            escrow_available: 0,
            is_active: false,
            registered_at: 0,
        }
    }
}

#[contract]
pub struct TankoRegistry;

#[contractimpl]
impl TankoRegistry {
    pub fn init(env: Env, admin: Address) {
        assert!(
            env.storage()
                .instance()
                .get::<_, Address>(&DataKey::Admin)
                .is_none(),
            "Already initialized"
        );
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    pub fn add_driver(env: Env, admin: Address, driver: Address) {
        let stored_admin = env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Contract not initialized"));

        assert!(admin == stored_admin, "Only admin can add drivers");
        admin.require_auth();

        let mut drivers = env
            .storage()
            .instance()
            .get::<_, Map<Address, bool>>(&DataKey::Drivers)
            .unwrap_or_else(|| Map::new(&env));

        drivers.set(driver.clone(), true);
        env.storage().instance().set(&DataKey::Drivers, &drivers);

        let mut driver_configs = env
            .storage()
            .instance()
            .get::<_, Map<Address, DriverConfig>>(&DataKey::DriverConfigs)
            .unwrap_or_else(|| Map::new(&env));

        let now = env.ledger().timestamp();
        driver_configs.set(
            driver.clone(),
            DriverConfig {
                escrow_limit: 0,
                escrow_used: 0,
                escrow_available: 0,
                is_active: true,
                registered_at: now,
            },
        );
        env.storage()
            .instance()
            .set(&DataKey::DriverConfigs, &driver_configs);
    }

    pub fn add_station(env: Env, admin: Address, station: Address) {
        let stored_admin = env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Contract not initialized"));

        assert!(admin == stored_admin, "Only admin can add gas stations");
        admin.require_auth();

        let mut stations = env
            .storage()
            .instance()
            .get::<_, Map<Address, bool>>(&DataKey::GasStations)
            .unwrap_or_else(|| Map::new(&env));

        stations.set(station.clone(), true);
        env.storage()
            .instance()
            .set(&DataKey::GasStations, &stations);
    }

    pub fn verify_tx(env: Env, driver: Address, station: Address) -> bool {
        let drivers = env
            .storage()
            .instance()
            .get::<_, Map<Address, bool>>(&DataKey::Drivers)
            .unwrap_or_else(|| Map::new(&env));

        let stations = env
            .storage()
            .instance()
            .get::<_, Map<Address, bool>>(&DataKey::GasStations)
            .unwrap_or_else(|| Map::new(&env));

        let driver_verified = drivers.get(driver).unwrap_or(false);
        let station_verified = stations.get(station).unwrap_or(false);

        driver_verified && station_verified
    }

    pub fn get_driver_stats(env: Env, driver: Address) -> DriverConfig {
        let driver_configs = env
            .storage()
            .instance()
            .get::<_, Map<Address, DriverConfig>>(&DataKey::DriverConfigs)
            .unwrap_or_else(|| Map::new(&env));

        driver_configs.get(driver).unwrap_or_default()
    }

    pub fn update_driver_limit(env: Env, admin: Address, driver: Address, new_limit: i128) {
        let stored_admin = env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Contract not initialized"));

        assert!(admin == stored_admin, "Only admin can update driver limit");
        admin.require_auth();

        let mut driver_configs = env
            .storage()
            .instance()
            .get::<_, Map<Address, DriverConfig>>(&DataKey::DriverConfigs)
            .unwrap_or_else(|| Map::new(&env));

        let mut config = driver_configs.get(driver.clone()).unwrap_or_default();

        let used = config.escrow_used;
        config.escrow_limit = new_limit;
        config.escrow_available = new_limit.saturating_sub(used);

        driver_configs.set(driver, config);
        env.storage()
            .instance()
            .set(&DataKey::DriverConfigs, &driver_configs);
    }

    pub fn record_usage(env: Env, admin: Address, driver: Address, amount: i128) {
        let stored_admin = env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Contract not initialized"));

        assert!(admin == stored_admin, "Only admin can record usage");
        admin.require_auth();

        let mut driver_configs = env
            .storage()
            .instance()
            .get::<_, Map<Address, DriverConfig>>(&DataKey::DriverConfigs)
            .unwrap_or_else(|| Map::new(&env));

        let mut config = driver_configs.get(driver.clone()).unwrap_or_default();

        config.escrow_used = config.escrow_used.saturating_add(amount);
        config.escrow_available = config.escrow_limit.saturating_sub(config.escrow_used);

        driver_configs.set(driver, config);
        env.storage()
            .instance()
            .set(&DataKey::DriverConfigs, &driver_configs);
    }

    pub fn reset_driver_usage(env: Env, admin: Address, driver: Address) {
        let stored_admin = env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Contract not initialized"));

        assert!(admin == stored_admin, "Only admin can reset driver usage");
        admin.require_auth();

        let mut driver_configs = env
            .storage()
            .instance()
            .get::<_, Map<Address, DriverConfig>>(&DataKey::DriverConfigs)
            .unwrap_or_else(|| Map::new(&env));

        let mut config = driver_configs.get(driver.clone()).unwrap_or_default();

        config.escrow_used = 0;
        config.escrow_available = config.escrow_limit;

        driver_configs.set(driver, config);
        env.storage()
            .instance()
            .set(&DataKey::DriverConfigs, &driver_configs);
    }

    pub fn remove_driver(env: Env, admin: Address, driver: Address) {
        let stored_admin = env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Contract not initialized"));

        assert!(admin == stored_admin, "Only admin can remove drivers");
        admin.require_auth();

        let mut drivers = env
            .storage()
            .instance()
            .get::<_, Map<Address, bool>>(&DataKey::Drivers)
            .unwrap_or_else(|| Map::new(&env));

        drivers.set(driver.clone(), false);
        env.storage().instance().set(&DataKey::Drivers, &drivers);

        let mut driver_configs = env
            .storage()
            .instance()
            .get::<_, Map<Address, DriverConfig>>(&DataKey::DriverConfigs)
            .unwrap_or_else(|| Map::new(&env));

        let mut config = driver_configs.get(driver.clone()).unwrap_or_default();
        config.is_active = false;
        driver_configs.set(driver, config);
        env.storage()
            .instance()
            .set(&DataKey::DriverConfigs, &driver_configs);
    }

    pub fn remove_station(env: Env, admin: Address, station: Address) {
        let stored_admin = env
            .storage()
            .instance()
            .get::<_, Address>(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Contract not initialized"));

        assert!(admin == stored_admin, "Only admin can remove gas stations");
        admin.require_auth();

        let mut stations = env
            .storage()
            .instance()
            .get::<_, Map<Address, bool>>(&DataKey::GasStations)
            .unwrap_or_else(|| Map::new(&env));

        stations.set(station, false);
        env.storage()
            .instance()
            .set(&DataKey::GasStations, &stations);
    }

    pub fn is_driver_registered(env: Env, driver: Address) -> bool {
        let drivers = env
            .storage()
            .instance()
            .get::<_, Map<Address, bool>>(&DataKey::Drivers)
            .unwrap_or_else(|| Map::new(&env));

        drivers.get(driver).unwrap_or(false)
    }

    pub fn is_station_registered(env: Env, station: Address) -> bool {
        let stations = env
            .storage()
            .instance()
            .get::<_, Map<Address, bool>>(&DataKey::GasStations)
            .unwrap_or_else(|| Map::new(&env));

        stations.get(station).unwrap_or(false)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_driver_stats_default() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TankoRegistry);
        let client = TankoRegistryClient::new(&env, &contract_id);

        let result = client.get_driver_stats(&Address::generate(&env));
        assert_eq!(result.escrow_limit, 0);
        assert_eq!(result.escrow_used, 0);
        assert_eq!(result.escrow_available, 0);
        assert_eq!(result.is_active, false);
    }
}
