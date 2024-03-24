export default class hmrc {
    constructor() {
        const that = this
    }
    
    public login() {

    
    
    let url = 'https://test-www.tax.service.gov.uk/oauth/authorize?'
      + 'response_type=code'
      + '&client_id=VooJtM2gsbwDjEmSHIci4WEab657'
      + '&scope=read:vat'
      + '&state=state1'
      + '&redirect_uri=https://digitaltalc.com'
    //  + '&code_challenge=[CODE-CHALLENGE]'
    //  + '&code_challenge_method=[CODE-CHALLENGE-METHOD]'
    window.location.href = url;
    //console.log(url)
    //var response = UrlFetchApp.fetch(url, options);
    //Logger.log(response);
    
   //   let url = 'https://test-api.service.hmrc.gov.uk/organisations/vat/460042827/obligations';
    //var response = fetch(url, options);
    //Logger.log(response);
    }
}