/**
 * TourAPI 1.0 Response Types
 */

export interface TourApiResponse<T> {
    response: {
        header: {
            resultCode: string;
            resultMsg: string;
        };
        body: {
            items: {
                item: T[];
            } | string; // If no data, it can be an empty string
            numOfRows: number;
            pageNo: number;
            totalCount: number;
        };
    };
}

/**
 * Base Item Fields (Common in most list APIs)
 */
export interface BaseTourItem {
    contentid: string;
    contenttypeid: string;
    title: string;
    addr1?: string;
    addr2?: string;
    mapx?: string;
    mapy?: string;
    mlevel?: string;
    tel?: string;
    firstimage?: string;
    firstimage2?: string;
    createdtime?: string;
    modifiedtime?: string;
    booktour?: string;
    cpyrhtDivCd?: string; // Copyright Division Code
}

/**
 * Festival Item (from searchFestival1)
 */
export interface FestivalItem extends BaseTourItem {
    eventstartdate: string;
    eventenddate: string;
}

/**
 * Detail Common Info (from detailCommon1)
 */
export interface DetailCommonItem extends BaseTourItem {
    overview: string;
    homepage?: string;
    telname?: string;
    zipcode?: string;
}

/**
 * Detail Intro Info (from detailIntro1 - ContentType 15: Festival/Events)
 */
export interface FestivalIntroItem {
    contentid: string;
    contenttypeid: string;
    eventstartdate: string;
    eventenddate: string;
    eventplace: string;
    playtime: string;
    usetimefestival: string; // Usage fee info (Important for is_free)
    agelimit?: string;
    bookingplace?: string;
    discountinfofestival?: string;
    eventhomepage?: string;
    program?: string;
    spendtimefestival?: string;
    sponsor1?: string;
    sponsor1tel?: string;
    sponsor2?: string;
    sponsor2tel?: string;
    subevent?: string;
}

/**
 * Detail Intro Info (from detailIntro1 - ContentType 14: Culture Facilities)
 */
export interface CultureIntroItem {
    contentid: string;
    contenttypeid: string;
    infocenterculture: string;
    parkingculture: string; // Parking info
    usetimeculture: string;
    usefee: string;
    restdateculture: string;
    chkbabycarriageculture: string; // Stroller access info
    chkpetculture: string;
    chkcreditcardculture: string;
    scale: string;
    spendtime: string;
}

/**
 * Image Item (from detailImage1)
 */
export interface TourImageItem {
    contentid: string;
    imgname: string;
    originimgurl: string;
    smallimageurl: string;
    cpyrhtDivCd: string;
}
