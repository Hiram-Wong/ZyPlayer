!macro preInit
    # electron win自定义安装路径完美版
    Var /GLOBAL installDir
	SetRegView 64
    ReadRegStr $installDir HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation
    ${if} $installDir == ""
        WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "D:\zyplayer"
    ${endif}

    ReadRegStr $installDir HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation
    ${if} $installDir == ""
         WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "D:\zyplayer"
    ${endif}

	# SetRegView 32 almost ...
!macroend

!macro customRemoveFiles
    ${if} ${isUpdated}
        !insertmacro quitSuccess
    ${else}
        RMDir /r $INSTDIR
    ${endIf}
!macroend

!macro customUnWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "卸载本软件"
  !define MUI_WELCOMEPAGE_TEXT "卸载本软件后会删除本软件的所有数据。请备份好重要数据！！！"
  !insertmacro MUI_UNPAGE_WELCOME
!macroend