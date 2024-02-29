type DriveSettings = {
	v3?: boolean;
	title?: string;
	version?: string;
	enableSearch?: boolean;
};

type DriveAPI = {
	path?: string;
	file?: string;
	search?: string;
	other?: string | null;
};

type DriveData = {
	name: string;
	server: string;
	startPage: string;
	showAll: boolean;
	params: Record<string, any>;
	settings: DriveSettings;
	api: DriveAPI;
};